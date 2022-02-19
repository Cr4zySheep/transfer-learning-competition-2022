import process from 'node:process';
import {Prisma, PrismaClient} from '@prisma/client';
import {NextApiRequest, NextApiResponse} from 'next';
import bcrypt from 'bcrypt';

import validate from 'middlewares/validate';
import schema, {
	TeamMemberRegistration,
	TeamRegistration,
} from 'schemas/teamRegistration';

const prisma = new PrismaClient();

/**
 * Create a new user.
 * @param values - New user data
 */
//  async function signup(
//   data: SignUpData,
//   res: NextApiResponse<UserWithoutPassword | string>
// ) {
//   const { email, username, password: rawPassword } = data;

//   try {
//     const { password, ...user } = await prisma.user.create({
//       data: {
//         email,
//         username,
//         password: await argon2.hash(rawPassword),
//       },
//     });

//     res.status(201).json(user);
//   } catch (err) {
//     if (err instanceof Prisma.PrismaClientKnownRequestError) {
//       // TODO: Better managment of Prisma error, using yup.ValidationError for example
//       res.status(400).end(err.message);
//     } else {
//       throw err;
//     }
//   }
// }

async function getAllTeams(response: NextApiResponse) {
	const teams = await prisma.team
		.findMany({include: {members: true}})
		.then((data) =>
			data.map(({password, ...team}) => ({
				...team,
				createdAt: team.createdAt.toISOString(),
				updatedAt: team.updatedAt.toISOString(),
				members: team.members.map((member) => ({
					...member,
					createdAt: member.createdAt.toISOString(),
					updatedAt: member.updatedAt.toISOString(),
				})),
			})),
		);

	response.status(200).send(teams);
}

function isFirstYearStudent(member: TeamMemberRegistration) {
	return member.isStudent === 'YES' && member.yearOfStudy === '1A';
}

async function register(data: TeamRegistration, response: NextApiResponse) {
	if (!data || !data.members) {
		response.status(400).send('');
		return;
	}

	const password = await bcrypt.hash(data.password, 10);

	// Prevent return the hashed password
	try {
		const {password: _, ...team} = await prisma.team.create({
			data: {
				...data,
				firstYearOnly: data.members.every((member) =>
					isFirstYearStudent(member),
				),
				password,
				members: {
					createMany: {
						data: data.members.map((member) => ({
							...member,
							isStudent: member.isStudent === 'YES',
						})),
					},
				},
			},
			include: {members: true},
		});

		response.status(201).json(team);
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
		case 'GET':
			if (request.query.password === process.env.ADMIN_PASSWORD) {
				await getAllTeams(response);
			} else {
				response.status(403).send(undefined);
			}

			break;

		case 'POST':
			await register(request.body, response);
			break;

		default:
			response.setHeader('Allow', ['GET', 'POST']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
}

export default validate(schema, handler);
