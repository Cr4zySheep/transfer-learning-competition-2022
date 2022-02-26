import {GetServerSideProps} from 'next';
import {PrismaClient} from '@prisma/client';

const VerifyToken = () => {
	return null;
};

export default VerifyToken;

export const getServerSideProps: GetServerSideProps = async ({
	res: response,
	params,
}) => {
	let redirectURL: string;

	const prisma = new PrismaClient();

	const token = (params?.token as string) || '';

	console.debug(`Verifying token: ${token}`);

	try {
		const [user] = await prisma.teamMember.findMany({
			where: {emailValidationToken: token},
			select: {id: true},
			take: 1,
		});
		await prisma.teamMember.update({
			where: {id: user.id},
			data: {emailValidated: new Date()},
		});
		redirectURL = '/token/success';
	} catch {
		redirectURL = '/token/error';
	}

	response.statusCode = 302;
	response.setHeader('location', redirectURL);

	return {props: {}};
};
