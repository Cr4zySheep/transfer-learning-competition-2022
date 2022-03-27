import process from 'node:process';
import {
	EvaluationStatus,
	Evaluation,
	EvaluationCriteria,
	PrismaClient,
	Prisma,
} from '@prisma/client';
import axios from 'axios';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {NextApiRequest, NextApiResponse} from 'next';

const prisma = new PrismaClient();

interface EvaluationData {
	name: string;
	idTeamA: number;
	idTeamB: number;
	assignedTeamId: number;
	assignedTeamMemberId: number;
	evaluationCriteria: 0 | 1 | 2 | 3;
}

const evaluationMapping = [
	EvaluationCriteria.CRITERIA_0,
	EvaluationCriteria.CRITERIA_1,
	EvaluationCriteria.CRITERIA_2,
	EvaluationCriteria.ALL,
];

const isScriptRunning: Record<number, boolean> = {};

async function getNextEvaluationForTeam(
	request: NextApiRequest,
	response: NextApiResponse,
) {
	const team = request.session.team!;
	const {ignoreId} = request.query;

	let evaluation: Evaluation | null;
	do {
		/* eslint-disable no-await-in-loop */

		// Assigné à moi ?
		evaluation = await prisma.evaluation.findFirst({
			where: {
				assignedTeamMemberId: team.memberId,
				status: EvaluationStatus.PENDING,
				NOT: {
					id: ignoreId ? Number(ignoreId) : undefined,
				},
			},
		});

		if (evaluation) continue;

		// Assigné à mon équipe ?
		evaluation = await prisma.evaluation.findFirst({
			where: {
				assignedTeamId: team.id,
				assignedTeamMemberId: null,
				status: EvaluationStatus.PENDING,
			},
		});

		if (evaluation) {
			const evaluations = await prisma.evaluation.updateMany({
				data: {
					assignedTeamMemberId: team.memberId,
					version: {increment: 1},
				},
				where: {
					id: evaluation.id,
					version: evaluation.version,
				},
			});

			if (evaluations.count === 0) {
				evaluation = null;
			}

			continue;
		}

		// Run le script si c'est pas le cas, sinon attends 1s
		if (isScriptRunning[team.id]) {
			await new Promise((resolve) => {
				setTimeout(resolve, 1000);
			});
		} else {
			isScriptRunning[team.id] = true;
			const evaluationsData = await axios
				.post<{evaluations: EvaluationData[]}>(
					`${process.env.PYTHON_SERVER ?? ''}/evaluations`,
					{
						teamId: team.id,
						teamMemberId: team.memberId,
					},
				)
				.then((response) => response.data.evaluations);

			const data = {
				data: evaluationsData.map((evaluationData) => ({
					name: evaluationData.name,
					idTeamA: evaluationData.idTeamA,
					idTeamB: evaluationData.idTeamB,
					assignedTeamId: evaluationData.assignedTeamId,
					assignedTeamMemberId: evaluationData.assignedTeamMemberId,
					evaluationCriteria:
						evaluationMapping[evaluationData.evaluationCriteria],
					version: 0,
				})),
			};

			await prisma.evaluation.createMany(data);
			isScriptRunning[team.id] = false;
		}
		/* eslint-enable no-await-in-loop */
	} while (!evaluation);

	response.send(evaluation);
}

async function getNextEvaluationForJury(
	request: NextApiRequest,
	response: NextApiResponse,
) {
	const jury = request.session.jury!;
	const {ignoreId} = request.query;

	let evaluation: Evaluation | null;
	do {
		/* eslint-disable no-await-in-loop */

		evaluation = await prisma.evaluation.findFirst({
			where: {
				assignedJuryId: jury.id,
				status: EvaluationStatus.PENDING,
				NOT: {
					id: ignoreId ? Number(ignoreId) : undefined,
				},
			},
		});

		if (evaluation) continue;

		const evaluationsData = await axios
			.post<{evaluations: EvaluationData[]}>(
				`${process.env.PYTHON_SERVER ?? ''}/evaluations`,
				{
					juryId: jury.id,
				},
			)
			.then((response) => response.data.evaluations);

		const data: Prisma.EvaluationCreateManyInput[] = evaluationsData.map(
			(evaluationData) => ({
				name: evaluationData.name,
				idTeamA: evaluationData.idTeamA,
				idTeamB: evaluationData.idTeamB,
				assignedJuryId: jury.id, // TODO: Maybe use the jury provided by the evaluation
				evaluationCriteria:
					evaluationMapping[evaluationData.evaluationCriteria],
				version: 0,
			}),
		);
		await prisma.evaluation.createMany({data});
		/* eslint-enable no-await-in-loop */
	} while (!evaluation);

	response.send(evaluation);
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
	const {team, jury} = request.session;

	switch (request.method) {
		case 'GET':
			if (
				// Team
				team &&
				(await prisma.team.findFirst({
					where: {id: team.id},
					select: {id: true},
				}))
			) {
				await getNextEvaluationForTeam(request, response);
			} else if (
				// Jury
				jury &&
				(await prisma.jury.findUnique({
					where: {id: jury.id},
					select: {id: true},
				}))
			) {
				await getNextEvaluationForJury(request, response);
			} else {
				response.status(401).send('You should be logged in.');
			}

			break;

		default:
			response.setHeader('Allow', ['GET']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
}

export default withIronSessionApiRoute(handler, sessionOptions);
