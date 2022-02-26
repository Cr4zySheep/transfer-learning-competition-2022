import {PrismaClient} from '@prisma/client';
import {NextApiRequest, NextApiResponse} from 'next';
import {number, object} from 'yup';
import validate from 'middlewares/validate';
import {generateEmailValidationToken} from 'utils';

const prisma = new PrismaClient();

const schema = object({id: number().required()});

async function handler(request: NextApiRequest, response: NextApiResponse) {
	switch (request.method) {
		case 'POST': {
			const id = request.body.id as number;
			try {
				const user = await prisma.teamMember.findUnique({
					where: {id},
					select: {id: true, email: true},
					rejectOnNotFound: true,
				});
				const token = await generateEmailValidationToken(user.email);
				const updatedUser = await prisma.teamMember.update({
					where: {id},
					data: {emailValidationToken: token, emailValidated: null},
				});
				response.status(200).json(updatedUser);
			} catch {
				response.status(400).end('Unknown user');
			}

			break;
		}

		default:
			response.setHeader('Allow', ['POST']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
}

export default validate(schema, handler);
