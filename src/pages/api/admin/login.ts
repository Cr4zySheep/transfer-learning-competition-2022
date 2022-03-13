import process from 'node:process';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {NextApiRequest, NextApiResponse} from 'next';

const adminLoginRoute = async (
	request: NextApiRequest,
	response: NextApiResponse,
) => {
	switch (request.method) {
		case 'POST': {
			if (request.body.password === process.env.ADMIN_PASSWORD) {
				request.session.admin = true;
				await request.session.save();
				response.send('');
			} else {
				response.status(403).send(undefined);
			}

			break;
		}

		default:
			response.setHeader('Allow', ['POST']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
};

export default withIronSessionApiRoute(adminLoginRoute, sessionOptions);
