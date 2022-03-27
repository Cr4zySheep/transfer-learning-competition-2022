import {
	EvaluationStatus,
	EvaluationCriteria,
	PrismaClient,
} from '@prisma/client';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {getNbRemainingEvaluations} from 'lib/team';
import {NextApiRequest, NextApiResponse} from 'next';

const prisma = new PrismaClient();

// Const PYTHON_SERVER = 'http://127.0.0.1:5000';

const evaluationMapping = {
	[EvaluationCriteria.CRITERIA_0]: 'criteria0',
	[EvaluationCriteria.CRITERIA_1]: 'criteria1',
	[EvaluationCriteria.CRITERIA_2]: 'criteria2',
};

async function handler(request: NextApiRequest, response: NextApiResponse) {
	const team = request.session.team;

	if (
		!team ||
		!(await prisma.team.findFirst({where: {id: team.id}, select: {id: true}}))
	) {
		response.status(401).send('You should be logged in.');
		return;
	}

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
}

export default withIronSessionApiRoute(handler, sessionOptions);
