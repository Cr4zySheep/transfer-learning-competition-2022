import process from 'node:process';
import {
	EvaluationCriteria,
	PrismaClient,
	Prisma,
	ControlPairCandidate,
} from '@prisma/client';
import axios from 'axios';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {NextApiRequest, NextApiResponse} from 'next';

const prisma = new PrismaClient();

interface ControlPairCandidateData {
	name: string;
	idTeamA: number;
	idTeamB: number;
	evaluationCriteria: 0 | 1 | 2 | 3;
}

const evaluationMapping = [
	EvaluationCriteria.CRITERIA_0,
	EvaluationCriteria.CRITERIA_1,
	EvaluationCriteria.CRITERIA_2,
	EvaluationCriteria.ALL,
];

const nameToChoiceField: Record<string, 'nicolasChoice' | 'julesChoice'> = {
	nicolas: 'nicolasChoice',
	jules: 'julesChoice',
};

let isScriptRunning = false;

async function getNextControlPairCandidate(
	request: NextApiRequest,
	response: NextApiResponse,
) {
	const {name, ignoreId} = request.query;

	if (!['nicolas', 'jules'].includes(name as string)) {
		response.status(400).send('Wrong name');
		return;
	}

	let controlPairCandidate: ControlPairCandidate | null;
	do {
		/* eslint-disable no-await-in-loop */

		controlPairCandidate = await prisma.controlPairCandidate.findFirst({
			where: {
				[nameToChoiceField[name as string]]: null,
				NOT: {
					id: ignoreId ? Number(ignoreId) : undefined,
				},
			},
		});

		if (controlPairCandidate) continue;

		// Run le script si c'est pas le cas, sinon attends 1s
		if (isScriptRunning) {
			await new Promise((resolve) => {
				setTimeout(resolve, 1000);
			});
		} else {
			isScriptRunning = true;
			const controlPairCandidatesData = await axios
				.post<ControlPairCandidateData[]>(
					`${process.env.PYTHON_SERVER ?? ''}/control-pair-candidates`,
				)
				.then((response) => response.data);

			const data: Prisma.ControlPairCandidateCreateManyInput[] =
				controlPairCandidatesData.map((evaluationData) => ({
					name: evaluationData.name,
					idTeamA: evaluationData.idTeamA,
					idTeamB: evaluationData.idTeamB,
					evaluationCriteria:
						evaluationMapping[evaluationData.evaluationCriteria],
					version: 0,
					nicolasGoodCandidate: false,
					julesGoodCandidate: false,
				}));

			await prisma.controlPairCandidate.createMany({data});
			isScriptRunning = false;
		}
		/* eslint-enable no-await-in-loop */
	} while (!controlPairCandidate);

	response.send(controlPairCandidate);
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
	const {admin} = request.session;

	switch (request.method) {
		case 'GET':
			if (admin) {
				await getNextControlPairCandidate(request, response);
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
