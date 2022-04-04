import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {ResetPasswordData, resetPasswordSchema} from 'schemas/auth';
import validate from 'middlewares/validate';
import {NextApiRequest, NextApiResponse} from 'next';
import bcrypt from 'bcrypt';
import {sendPasswordHasBeenChangedMail} from 'utils';
import prisma from 'db';

const loginRoute = async (
	request: NextApiRequest,
	response: NextApiResponse,
) => {
	switch (request.method) {
		case 'POST': {
			const data = request.body as ResetPasswordData;

			try {
				// Find corresponding team
				const [team] = await prisma.team.findMany({
					where: {resetPasswordToken: data.token},
					select: {id: true},
					take: 1,
				});

				// Update the password
				const password = await bcrypt.hash(data.password, 10);
				const teamWithMembers = await prisma.team.update({
					where: {id: team.id},
					data: {
						resetPasswordToken: '',
						resetPasswordConsentToken: '',
						password,
					},
					include: {members: true},
				});
				response.send('Password updated successfully.');

				// Warn the whole team
				await sendPasswordHasBeenChangedMail(teamWithMembers.members);
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
	validate(resetPasswordSchema, loginRoute),
	sessionOptions,
);
