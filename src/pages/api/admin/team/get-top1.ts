import process from 'node:process';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import isAdmin from 'middlewares/isAdmin';
import {NextApiRequest, NextApiResponse} from 'next';
import axios from 'axios';
import {getControlPairs, getEvaluationDataForJury} from 'utils';

async function handler(request: NextApiRequest, response: NextApiResponse) {
	switch (request.method) {
		case 'GET': {
			const [controlPairs, evaluationData] = await Promise.all([
				getControlPairs(),
				getEvaluationDataForJury(),
			]);

			const ids = await axios
				.post<number[]>(`${process.env.PYTHON_SERVER ?? ''}/top3`, {
					controlPairs,
					evaluationData,
				})
				.then((response) => response.data);

			console.log(ids);
			response.send('OK');
			break;
		}

		default:
			response.setHeader('Allow', ['GET']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
}

export default withIronSessionApiRoute(isAdmin(handler), sessionOptions);
