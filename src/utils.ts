import crypto from 'node:crypto';
import {PrismaClient} from '@prisma/client';

const prisma = new PrismaClient();

export async function generateEmailValidationToken(
	email: string,
): Promise<string> {
	// TODO: Send an email
	let token: string;
	let isTaken: boolean;
	do {
		token = crypto.randomBytes(32).toString('hex');
		/* eslint-disable no-await-in-loop */
		isTaken = await prisma.teamMember
			.findMany({
				where: {emailValidationToken: token},
				select: {id: true},
				take: 1,
			})
			.then((data) => data.length > 0);
		/* eslint-enable no-await-in-loop */
	} while (isTaken);

	console.log(`Generated token from ${email}: ${token}`);

	return token;
}
