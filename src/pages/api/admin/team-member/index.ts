import {PrismaClient} from '@prisma/client';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {parseTeamWithMembersAndSubmissionToJson} from 'lib/team';
import isAdmin from 'middlewares/isAdmin';
import validate from 'middlewares/validate';
import {NextApiRequest, NextApiResponse} from 'next';
import {teamMemberRegistration} from 'schemas/teamRegistration';
import * as yup from 'yup';

const prisma = new PrismaClient();

const schema = yup
	.object({teamId: yup.number().required()})
	.concat(teamMemberRegistration);
type schemaType = yup.InferType<typeof schema>;

const addNewTeamMember = validate(schema, async (request, response) => {
	const data = request.body as schemaType;

	try {
		await prisma.teamMember.create({
			data: {
				...data,
				isStudent: data.isStudent === 'YES',
			},
		});

		const updatedTeam = await prisma.team.findUnique({
			where: {id: data.teamId},
			include: {members: true, submissions: {orderBy: {submittedAt: 'desc'}}},
			rejectOnNotFound: true,
		});

		response.send(parseTeamWithMembersAndSubmissionToJson(updatedTeam));
	} catch (error: unknown) {
		response.status(400).send(error);
		console.log(error);
	}
});

async function handler(request: NextApiRequest, response: NextApiResponse) {
	switch (request.method) {
		case 'POST':
			await addNewTeamMember(request, response);
			break;

		default:
			response.setHeader('Allow', ['POST']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
}

export default withIronSessionApiRoute(isAdmin(handler), sessionOptions);
