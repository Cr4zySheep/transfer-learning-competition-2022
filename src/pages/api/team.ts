import {PrismaClient} from '@prisma/client';
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
	const {password: _, ...team} = await prisma.team.create({
		data: {
			...data,
			firstYearOnly: data.members.every((member) => isFirstYearStudent(member)),
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
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
	switch (request.method) {
		case 'GET':
			// Await getAllUsers(res);
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
