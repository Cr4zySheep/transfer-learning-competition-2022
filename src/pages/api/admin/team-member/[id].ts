import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {parseTeamWithMembersAndSubmissionToJson} from 'lib/team';
import isAdmin from 'middlewares/isAdmin';
import validate from 'middlewares/validate';
import {NextApiRequest, NextApiResponse} from 'next';
import {
	teamMemberRegistration,
	TeamMemberRegistrationData,
} from 'schemas/teamRegistration';
import * as yup from 'yup';
import prisma from 'db';

async function deleteTeamMember(id: number) {
	await prisma.teamMember.delete({where: {id}});
}

const updateTeamMember = validate(
	teamMemberRegistration,
	async (request, response) => {
		const id = request.query.id as string;
		const data = request.body as TeamMemberRegistrationData;

		const {teamId} = await prisma.teamMember.update({
			where: {id: Number(id)},
			data: {
				...data,
				isStudent: data.isStudent === 'YES',
			},
		});

		const updatedTeam = await prisma.team.findUnique({
			where: {id: teamId},
			include: {members: true, submissions: {orderBy: {submittedAt: 'desc'}}},
			rejectOnNotFound: true,
		});

		response.send(parseTeamWithMembersAndSubmissionToJson(updatedTeam));
	},
);
const addNewTeamMember = validate(
	yup.object({teamId: yup.number().required()}).concat(teamMemberRegistration),
	async (request, response) => {
		const id = request.query.id as string;
		const data = request.body as TeamMemberRegistrationData;

		const {teamId} = await prisma.teamMember.update({
			where: {id: Number(id)},
			data: {
				...data,
				isStudent: data.isStudent === 'YES',
			},
		});

		const updatedTeam = await prisma.team.findUnique({
			where: {id: teamId},
			include: {members: true, submissions: {orderBy: {submittedAt: 'desc'}}},
			rejectOnNotFound: true,
		});

		response.send(parseTeamWithMembersAndSubmissionToJson(updatedTeam));
	},
);

async function handler(request: NextApiRequest, response: NextApiResponse) {
	const id = request.query.id as string;

	switch (request.method) {
		case 'DELETE':
			await deleteTeamMember(Number(id));
			response.send('');
			break;

		case 'PUT':
			await updateTeamMember(request, response);
			break;

		case 'POST':
			await addNewTeamMember(request, response);
			break;

		default:
			response.setHeader('Allow', ['DELETE', 'PUT', 'POST']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
}

export default withIronSessionApiRoute(isAdmin(handler), sessionOptions);
