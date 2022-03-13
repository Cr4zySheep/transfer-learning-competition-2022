import {NextApiHandler, NextApiRequest, NextApiResponse} from 'next';

export default function isAdmin(handler: NextApiHandler): NextApiHandler {
	return async (request: NextApiRequest, response: NextApiResponse) => {
		if (!request.session?.admin) {
			response.status(403).send('You should be admin.');
			return;
		}

		await handler(request, response);
	};
}
