import {
	COMPETITION_START,
	PARTICIPANT_SUBMISSION_DEADLINE,
	REGISTRATION_DEADLINE,
} from 'consts';
import {formatDistanceStrict} from 'date-fns';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {NextApiRequest, NextApiResponse} from 'next';

async function handler(request: NextApiRequest, response: NextApiResponse) {
	switch (request.method) {
		case 'GET': {
			const now = new Date();

			response.send({
				now: now.toISOString(),
				registration: REGISTRATION_DEADLINE.toISOString(),
				registration_remaining: formatDistanceStrict(
					new Date(),
					REGISTRATION_DEADLINE,
					{unit: 'minute'},
				),
				competition_start: COMPETITION_START.toISOString(),
				competition_start_remaining: formatDistanceStrict(
					new Date(),
					COMPETITION_START,
					{unit: 'minute'},
				),
				submission_deadline: PARTICIPANT_SUBMISSION_DEADLINE.toISOString(),
				submission_deadline_remaining: formatDistanceStrict(
					new Date(),
					PARTICIPANT_SUBMISSION_DEADLINE,
					{unit: 'minute'},
				),
			});

			break;
		}

		default:
			response.setHeader('Allow', ['DELETE']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
}

export default withIronSessionApiRoute(handler, sessionOptions);
