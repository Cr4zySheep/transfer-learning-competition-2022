import {PrismaClient} from '@prisma/client';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {ResetPasswordData, resetPasswordSchema} from 'schemas/auth';
import validate from 'middlewares/validate';
import {NextApiRequest, NextApiResponse} from 'next';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const resetPasswordRoute = async (
	request: NextApiRequest,
	response: NextApiResponse,
) => {
	switch (request.method) {
		case 'POST': {
			const data = request.body as ResetPasswordData;

			try {
				// Find corresponding jury
				const [jury] = await prisma.jury.findMany({
					where: {resetPasswordToken: data.token},
					select: {id: true, resetPasswordToken: true},
					take: 1,
				});

				console.log(jury, data.token);

				// Update the password
				const password = await bcrypt.hash(data.password, 10);
				await prisma.jury.update({
					where: {id: jury.id},
					data: {
						resetPasswordToken: '',
						password,
					},
				});
				response.send('Password updated successfully.');
			} catch {
				response.status(403).send('Invalid token');
			}

			break;
		}

		default:
			response.setHeader('Allow', ['POST']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
};

export default withIronSessionApiRoute(
	validate(resetPasswordSchema, resetPasswordRoute),
	sessionOptions,
);
