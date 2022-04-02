import process from 'node:process';
import {Prisma, ControlPairCandidate} from '@prisma/client';
import axios from 'axios';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {NextApiRequest, NextApiResponse} from 'next';
import {
	evaluationCriteriaToLabel,
	getControlPairs,
	labelToEvaluationCriteria,
} from 'utils';
import {prisma} from 'db';

interface ControlPairCandidateData {
	name: string;
	idTeamA: number;
	idTeamB: number;
	evaluationCriteria: 'realistic' | 'targeted';
}

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

			try {
				// Fetch all candidates
				const candidatesData = await prisma.controlPairCandidate.findMany({});
				const candidates = candidatesData.map((candidate) => ({
					id: candidate.id,
					name: candidate.name,
					idTeamA: candidate.idTeamA,
					idTeamB: candidate.idTeamB,
					evaluationCriteria: evaluationCriteriaToLabel(
						candidate.evaluationCriteria,
					),
				}));

				// Fetch all control pair
				const controlPairs = await getControlPairs();

				// Get new candidates
				const controlPairCandidatesData = await axios
					.post<ControlPairCandidateData[]>(
						`${process.env.PYTHON_SERVER ?? ''}/control-pair-candidates`,
						{candidates, controlPairs},
					)
					.then((response) => response.data);

				const data: Prisma.ControlPairCandidateCreateManyInput[] =
					controlPairCandidatesData.map((evaluationData) => ({
						name: evaluationData.name,
						idTeamA: evaluationData.idTeamA,
						idTeamB: evaluationData.idTeamB,
						evaluationCriteria: labelToEvaluationCriteria(
							evaluationData.evaluationCriteria,
						),
						version: 0,
						nicolasGoodCandidate: false,
						julesGoodCandidate: false,
					}));

				await prisma.controlPairCandidate.createMany({data});
			} catch (error: unknown) {
				console.log();
				console.log('Error while fetching control pairs candidates');
				console.log(error);
				await new Promise((resolve) => {
					setTimeout(resolve, 1000);
				});
			}

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
