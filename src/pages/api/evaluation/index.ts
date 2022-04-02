import {EvaluationStatus, Evaluation, PrismaClient} from '@prisma/client';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {NextApiRequest, NextApiResponse} from 'next';
import {replenishBufferForJury, replenishBufferForTeam} from 'utils';

const prisma = new PrismaClient();

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
			try {
				await replenishBufferForTeam(team);
			} catch (error: unknown) {
				console.log();
				console.log('Errors while fetching evaluation for team', team);
				console.log(error);
				await new Promise((resolve) => {
					setTimeout(resolve, 1000);
				});
			}

			isScriptRunning[team.id] = false;
		}
		/* eslint-enable no-await-in-loop */
	} while (!evaluation);

	response.send(evaluation);

	const nbBuffer = await prisma.evaluation.count({
		where: {
			assignedTeamId: team.id,
			criteria0: null,
			criteria1: null,
		},
	});

	// Too low buffer, replenish it
	if (nbBuffer < 4 && !isScriptRunning[team.id]) {
		isScriptRunning[team.id] = true;
		try {
			await replenishBufferForTeam(team);
		} catch (error: unknown) {
			console.log();
			console.log('Errors while fetching evaluation for team', team);
			console.log(error);
		}

		isScriptRunning[team.id] = false;
	}
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

		try {
			await replenishBufferForJury(jury.id);
		} catch (error: unknown) {
			console.log();
			console.log('Errors while fetching evaluation for jury', jury);
			console.log(error);
			await new Promise((resolve) => {
				setTimeout(resolve, 1000);
			});
		}

		/* eslint-enable no-await-in-loop */
	} while (!evaluation);

	response.send(evaluation);

	const nbBuffer = await prisma.evaluation.count({
		where: {
			assignedJuryId: jury.id,
			criteria0: null,
			criteria1: null,
		},
	});

	// Too low buffer, replenish it
	if (nbBuffer < 3) {
		try {
			await replenishBufferForJury(jury.id);
		} catch (error: unknown) {
			console.log();
			console.log('Errors while fetching evaluation for jury', jury);
			console.log(error);
		}
	}
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
