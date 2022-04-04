import {EvaluationStatus, EvaluationCriteria} from '@prisma/client';
import {withIronSessionApiRoute} from 'iron-session/next';
import {getNbEvaluationsDone} from 'lib/jury';
import {sessionOptions} from 'lib/session';
import {getNbRemainingEvaluations} from 'lib/teamBack';
import {NextApiRequest, NextApiResponse} from 'next';
import prisma from 'db';

const evaluationMapping = {
	[EvaluationCriteria.CRITERIA_0]: 'criteria0',
	[EvaluationCriteria.CRITERIA_1]: 'criteria1',
	[EvaluationCriteria.CRITERIA_2]: 'criteria2',
};

async function handler(request: NextApiRequest, response: NextApiResponse) {
	const team = request.session.team;
	const jury = request.session.jury;

	if (
		team &&
		(await prisma.team.findFirst({where: {id: team.id}, select: {id: true}}))
	) {
		// Get the evaluation
		const evaluation = await prisma.evaluation.findUnique({
			where: {id: Number(request.query.id as string)},
		});
		if (!evaluation) {
			response.status(404).send('Not found');
			return;
		}

		switch (request.method) {
			case 'POST': {
				if (evaluation.assignedTeamId !== team.id) {
					response.status(401).send('Not assigned to you.');
				}

				const choice = Boolean(request.body.choice);

				if (evaluation.evaluationCriteria === EvaluationCriteria.ALL) {
					console.log('Not implemented yet');
				} else {
					const criteria = evaluationMapping[evaluation.evaluationCriteria];

					await prisma.evaluation.update({
						where: {id: evaluation.id},
						data: {[criteria]: choice, status: EvaluationStatus.DONE},
					});
				}

				const nbRemainingEvaluations = await getNbRemainingEvaluations(team.id);
				response.send(nbRemainingEvaluations);

				break;
			}

			default:
				response.setHeader('Allow', ['POST', 'GET']);
				response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
		}
	} else if (
		jury &&
		(await prisma.jury.findUnique({where: {id: jury.id}, select: {id: true}}))
	) {
		// Get the evaluation
		const evaluation = await prisma.evaluation.findUnique({
			where: {id: Number(request.query.id as string)},
		});
		if (!evaluation) {
			response.status(404).send('Not found');
			return;
		}

		switch (request.method) {
			case 'POST': {
				if (evaluation.assignedJuryId !== jury.id) {
					response.status(401).send('Not assigned to you.');
				}

				const choice = Boolean(request.body.choice);

				if (evaluation.evaluationCriteria === EvaluationCriteria.ALL) {
					console.log('Not implemented yet');
				} else {
					const criteria = evaluationMapping[evaluation.evaluationCriteria];

					await prisma.evaluation.update({
						where: {id: evaluation.id},
						data: {[criteria]: choice, status: EvaluationStatus.DONE},
					});
				}

				const nbEvaluationsDone = await getNbEvaluationsDone(jury.id);
				response.send(nbEvaluationsDone);

				break;
			}

			default:
				response.setHeader('Allow', ['POST', 'GET']);
				response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
		}
	} else {
		response.status(401).send('You should be logged in.');
	}
}

export default withIronSessionApiRoute(handler, sessionOptions);
