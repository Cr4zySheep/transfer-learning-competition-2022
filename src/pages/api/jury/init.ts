import {PrismaClient} from '@prisma/client';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {forgottenPasswordSchema} from 'schemas/auth';
import validate from 'middlewares/validate';
import {NextApiRequest, NextApiResponse} from 'next';
import {generateResetPasswordTokenJury} from 'utils';

const jurysData = [
	{
		firstName: 'Damien',
		lastName: 'Fourure',
		email: 'damien.fourure@euranova.eu',
	},
	{
		firstName: 'Gaurav',
		lastName: 'Kumar',
		email: 'gaurav.kumar@reactivereality.com',
	},
	{
		firstName: 'Francesca',
		lastName: 'Bugiotti',
		email: 'francesca.bugiotti@centralesupelec.fr',
	},
];

const prisma = new PrismaClient();

const loginRoute = async (
	request: NextApiRequest,
	response: NextApiResponse,
) => {
	switch (request.method) {
		case 'GET': {
			const jurys = await prisma.jury.createMany({
				data: await Promise.all(
					jurysData.map(async (juryData) => ({
						...juryData,
						resetPasswordToken: await generateResetPasswordTokenJury(),
					})),
				),
			});

			// The response won't depend from happen next, so answer directly.
			response.send(jurys);

			break;
		}

		default:
			response.setHeader('Allow', ['GET']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
};

export default withIronSessionApiRoute(
	validate(forgottenPasswordSchema, loginRoute),
	sessionOptions,
);
