import {NextApiRequest, NextApiResponse} from 'next';
import {number, object} from 'yup';
import validate from 'middlewares/validate';
import {generateEmailValidationToken, sendValidationEmail} from 'utils.server';
import prisma from 'db';

const schema = object({id: number().required()});

async function handler(request: NextApiRequest, response: NextApiResponse) {
	switch (request.method) {
		case 'POST': {
			const id = request.body.id as number;
			try {
				// Check that user exists
				await prisma.teamMember.findUnique({
					where: {id},
					select: {id: true, email: true},
					rejectOnNotFound: true,
				});

				// Generate a new token
				const token = await generateEmailValidationToken();
				const updatedUser = await prisma.teamMember.update({
					where: {id},
					data: {emailValidationToken: token, emailValidated: null},
				});
				response.status(200).json(updatedUser);

				await sendValidationEmail(
					updatedUser.firstName,
					updatedUser.email,
					updatedUser.emailValidationToken!, // Won't be null since it was generated above
				);
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
