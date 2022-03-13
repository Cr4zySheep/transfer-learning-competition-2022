import {Prisma, PrismaClient} from '@prisma/client';
import {NextApiRequest, NextApiResponse} from 'next';
import bcrypt from 'bcrypt';

import validate from 'middlewares/validate';
import schema, {
	TeamMemberRegistration,
	TeamRegistration,
} from 'schemas/teamRegistration';
import {generateEmailValidationToken, sendValidationEmail} from 'utils';

const prisma = new PrismaClient();

function isFirstYearStudent(member: TeamMemberRegistration) {
	return member.isStudent === 'YES' && member.yearOfStudy === '1A';
}

async function register(data: TeamRegistration, response: NextApiResponse) {
	if (!data || !data.members) {
		response.status(400).send('');
		return;
	}

	const password = await bcrypt.hash(data.password, 10);

	try {
		// Prevent returning the hashed password
		const {password: _, ...team} = await prisma.team.create({
			data: {
				...data,
				firstYearOnly: data.members.every((member) =>
					isFirstYearStudent(member),
				),
				password,
				members: {
					createMany: {
						data: await Promise.all(
							data.members.map(async (member) => ({
								...member,
								isStudent: member.isStudent === 'YES',
								emailValidationToken: await generateEmailValidationToken(),
							})),
						),
					},
				},
			},
			include: {members: true},
		});

		response.status(201).json(team);

		await Promise.all(
			team.members.map(async (member) =>
				sendValidationEmail(
					member.firstName,
					member.email,
					member.emailValidationToken!, // Won't be null since it was generated above
				),
			),
		);
	} catch (error: unknown) {
		if (error instanceof Prisma.PrismaClientKnownRequestError) {
			// TODO: Better managment of Prisma error, using yup.ValidationError for example
			response.status(400).end(error.message);
		} else {
			throw error;
		}
	}
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
	switch (request.method) {
		case 'POST':
			await register(request.body, response);
			break;

		default:
			response.setHeader('Allow', ['POST']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
}

export default validate(schema, handler);
