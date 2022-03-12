import {PrismaClient} from '@prisma/client';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {loginSchema, LoginData} from 'schemas/auth';
import validate from 'middlewares/validate';
import {NextApiRequest, NextApiResponse} from 'next';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const loginRoute = async (
	request: NextApiRequest,
	response: NextApiResponse,
) => {
	switch (request.method) {
		case 'POST': {
			const data = request.body as LoginData;
			const team = await prisma.team.findFirst({
				where: {
					members: {
						some: {
							email: data.email,
							NOT: {emailValidated: null},
						},
					},
				},
			});

			if (!team || !(await bcrypt.compare(data.password, team.password))) {
				response
					.status(400)
					.end("This email and password isn't linked to any team.");
				return;
			}

			// Then, get user from database then:
			request.session.team = {
				id: team.id,
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
