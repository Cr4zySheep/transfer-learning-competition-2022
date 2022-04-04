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
			const jury = await prisma.jury.findFirst({
				where: {
					email: data.email,
				},
			});

			if (!jury || !(await bcrypt.compare(data.password, jury.password))) {
				response
					.status(400)
					.end("This email and password isn't linked to any jury.");
				return;
			}

			// Then, get user from database then:
			request.session.jury = {
				id: jury.id,
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
