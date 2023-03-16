import {GetServerSideProps} from 'next';
import {generateResetPasswordToken, sendResetPasswordEmail} from 'utils.server';
import prisma from 'db';

const VerifyToken = () => {
	return null;
};

export default VerifyToken;

export const getServerSideProps: GetServerSideProps = async ({params}) => {
	let redirectURL: string;

	const token = (params?.token as string) || '';

	console.debug(`Giving consent: ${token}`);

	try {
		const [team] = await prisma.team.findMany({
			where: {resetPasswordConsentToken: token},
			select: {id: true},
			take: 1,
		});

		const resetPasswordToken = await generateResetPasswordToken();
		await prisma.team.update({
			where: {id: team.id},
			data: {resetPasswordToken},
		});

		const author = await prisma.teamMember.findFirst({
			where: {isResetPasswordAuthor: true, teamId: team.id},
			rejectOnNotFound: true,
		});
		await sendResetPasswordEmail(author, resetPasswordToken);

		redirectURL = '/accept-password-reset/success';
	} catch {
		redirectURL = '/accept-password-reset/error';
	}

	return {
		redirect: {
			destination: redirectURL,
			permanent: false,
		},
	};
};
