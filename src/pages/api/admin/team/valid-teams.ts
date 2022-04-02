import fs from 'node:fs';
import process from 'node:process';
import path from 'node:path';
import {PrismaClient} from '@prisma/client';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import isAdmin from 'middlewares/isAdmin';
import {NextApiRequest, NextApiResponse} from 'next';
import {parseTeamWithMembersAndSubmissionToJson} from 'lib/team';
import axios from 'axios';

const prisma = new PrismaClient();

async function handler(request: NextApiRequest, response: NextApiResponse) {
	switch (request.method) {
		case 'GET': {
			const teams = await prisma.team.findMany({
				include: {members: true, submissions: {orderBy: {submittedAt: 'desc'}}},
			});

			await axios.post(
				`${process.env.PYTHON_SERVER ?? ''}/valid-teams`,
				teams.map((team) => ({
					teamId: team.id,
					participants: team.members.map((member) => member.id),
					submissions: team.submissions.map(
						(submission) => submission.fileName,
					),
					first_year: team.firstYearOnly,
				})),
			);

			await Promise.all(
				teams.map(async (team) => {
					let status: boolean;
					try {
						await fs.promises.access(
							path.join(process.env.MEDIA_PATH ?? '', `team-${team.id}`),
						);
						status = true;
					} catch {
						status = false;
					}

					await prisma.team.update({
						where: {id: team.id},
						data: {hasValidSubmission: status},
					});
				}),
			);

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
