import {PrismaClient} from '@prisma/client';
import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {ForgottenPasswordData, forgottenPasswordSchema} from 'schemas/auth';
import validate from 'middlewares/validate';
import {NextApiRequest, NextApiResponse} from 'next';
import {
	generateResetPasswordConsentToken,
	generateResetPasswordToken,
	sendResetPasswordConsentMail,
	sendResetPasswordEmail,
	sendResetPasswordInstructions,
} from 'utils';

const prisma = new PrismaClient();

const loginRoute = async (
	request: NextApiRequest,
	response: NextApiResponse,
) => {
	switch (request.method) {
		case 'POST': {
			// The response won't depend from happen next, so answer directly.
			response.send('');

			// Find the corresponding team, and if it exists, start the tedious process of resetting their password
			const data = request.body as ForgottenPasswordData;
			const team = await prisma.team.findFirst({
				where: {
					members: {
						some: {
							email: data.email,
						},
					},
				},
				include: {members: true},
			});

			if (!team) return;

			// If only one member, then directly sent the email with the reset link.
			// Otherwise, ask for consent of at least one other member of the team first.
			if (team.members.length === 1) {
				const token = await generateResetPasswordToken();
				await prisma.team.update({
					where: {id: team.id},
					data: {resetPasswordToken: token},
				});
				await sendResetPasswordEmail(team.members[0], token);
			} else {
				const remainingMembers = team.members.filter(
					(member) => member.email !== data.email,
				);
				const author = team.members.find(
					(member) => member.email === data.email,
				)!; // We know that he exists

				const token = await generateResetPasswordConsentToken();
				await Promise.all([
					prisma.team.update({
						where: {id: team.id},
						data: {resetPasswordConsentToken: token, resetPasswordToken: ''},
					}),
					prisma.teamMember.updateMany({
						where: {id: {in: remainingMembers.map((member) => member.id)}},
						data: {isResetPasswordAuthor: false},
					}),
					prisma.teamMember.update({
						where: {
							id: author.id,
						},
						data: {isResetPasswordAuthor: true},
					}),
				]);

				// Ask for consent
				await sendResetPasswordConsentMail(remainingMembers, author, token);

				// Warn the initial author
				await sendResetPasswordInstructions(author);
			}

			break;
		}

		default:
			response.setHeader('Allow', ['POST']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
};

export default withIronSessionApiRoute(
	validate(forgottenPasswordSchema, loginRoute),
	sessionOptions,
);
