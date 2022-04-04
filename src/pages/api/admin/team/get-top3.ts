import process from 'node:process';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import isAdmin from 'middlewares/isAdmin';
import {NextApiRequest, NextApiResponse} from 'next';
import {parseTeamWithMembersAndSubmissionToJson} from 'lib/team';
import axios from 'axios';
import {getControlPairs, getEvaluationDataForTeams} from 'utils';
import prisma from 'db';

async function handler(request: NextApiRequest, response: NextApiResponse) {
	switch (request.method) {
		case 'GET': {
			const [controlPairs, evaluationData] = await Promise.all([
				getControlPairs(),
				getEvaluationDataForTeams(),
			]);

			const idsTop3 = await axios
				.post<number[]>(`${process.env.PYTHON_SERVER ?? ''}/top3`, {
					controlPairs,
					evaluationData,
				})
				.then((response) => response.data);

			await prisma.team.updateMany({
				where: {id: {in: idsTop3}},
				data: {isTop3: true},
			});

			await prisma.team.updateMany({
				where: {id: {notIn: idsTop3}},
				data: {isTop3: false},
			});

			const updatedTeams = await prisma.team
				.findMany({
					include: {
						members: true,
						submissions: {orderBy: {submittedAt: 'desc'}},
					},
				})
				.then((data) =>
					data.map((team) => parseTeamWithMembersAndSubmissionToJson(team)),
				);

			response.send(updatedTeams);
			break;
		}

		default:
			response.setHeader('Allow', ['GET']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
}

export default withIronSessionApiRoute(isAdmin(handler), sessionOptions);
