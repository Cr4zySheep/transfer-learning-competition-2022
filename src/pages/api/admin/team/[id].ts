import fs from 'node:fs';
import {PrismaClient} from '@prisma/client';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import isAdmin from 'middlewares/isAdmin';
import {NextApiRequest, NextApiResponse} from 'next';

const prisma = new PrismaClient();

async function handler(request: NextApiRequest, response: NextApiResponse) {
	const id = Number(request.query.id as string);

	switch (request.method) {
		case 'DELETE': {
			await prisma.teamMember.deleteMany({where: {teamId: id}});
			const submissionsToDelete = await prisma.submission.findMany({
				where: {teamId: id},
			});

			await Promise.allSettled(
				submissionsToDelete.map(async (sub) => {
					await fs.promises.unlink(sub.fileName);
				}),
			);

			const ids = submissionsToDelete.map((sub) => sub.id);
			await prisma.submission.deleteMany({
				where: {id: {in: ids}},
			});

			await prisma.team.delete({where: {id}});

			response.send('');
			break;
		}

		default:
			response.setHeader('Allow', ['DELETE']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
}

export default withIronSessionApiRoute(isAdmin(handler), sessionOptions);
