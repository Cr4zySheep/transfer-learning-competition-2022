import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {loginSchema, LoginData} from 'schemas/auth';
import validate from 'middlewares/validate';
import {NextApiRequest, NextApiResponse} from 'next';
import bcrypt from 'bcrypt';
import prisma from 'db';

const loginRoute = async (
	request: NextApiRequest,
	response: NextApiResponse,
) => {
	switch (request.method) {
		case 'POST': {
			const data = request.body as LoginData;

			const member = await prisma.teamMember.findFirst({
				where: {
					email: data.email,
					NOT: {emailValidated: null},
				},
				include: {
					team: true,
				},
			});

			if (
				!member ||
				!(await bcrypt.compare(data.password, member.team.password))
			) {
				response
					.status(400)
					.end("This email and password isn't linked to any team.");
				return;
			}

			// Then, get user from database then:
			request.session.team = {
				id: member.teamId,
				memberId: member.id,
			};
			await request.session.save();
			response.send('');
			break;
		}

		default:
			response.setHeader('Allow', ['POST']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
};

export default withIronSessionApiRoute(
	validate(loginSchema, loginRoute),
	sessionOptions,
);
