import React, {useState} from 'react';
import {Button, Container, Grid, Typography} from '@mui/material';
import {JURY_END_DATETIME, JURY_START_DATETIME} from 'consts';
import {withIronSessionSsr} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {NextPage} from 'next';
import Link from 'next/link';

interface JuryHomePageProps {
	active: boolean;
}

const JuryHomePage: NextPage<JuryHomePageProps> = ({active}) => {
	const [counter] = useState(0);
	console.log('');

	return (
		<Container>
			<Grid container justifyContent="space-between" alignItems="baseline">
				<Grid item>
					<Typography gutterBottom variant="h1">
						Transfer Learning
					</Typography>
				</Grid>

				<Grid item>
					<Link passHref href="/logout">
						<Button variant="outlined">Log out</Button>
					</Link>
				</Grid>
			</Grid>

			<Typography paragraph>
				Dear committee member,
				<br />
				<br />
				Thank you for helping us review the top 3 of this competition&apos;s two
				leaderboards.
				<br />
				<br />
				First of all, please watch the following explanatory video :{' '}
				<strong>LINK</strong>
				<br />
				<br />
				Then, click the button below to start evaluating !
			</Typography>

			<Typography paragraph>Number of evaluations done: {counter}</Typography>

			<Button variant="contained" disabled={!active}>
				Start evaluating
			</Button>
		</Container>
	);
};

// @ts-expect-error iron-session est louche
export const getServerSideProps = withIronSessionSsr<JuryHomePageProps>(
	async ({req: request}) => {
		const jury = request.session.jury;

		if (!jury) {
			return {
				redirect: {
					destination: '/jury/login',
					permanent: false,
				},
			};
		}

		const today = new Date();

		return {
			props: {
				active: JURY_START_DATETIME <= today && today <= JURY_END_DATETIME,
			},
		};

		// Const prisma = new PrismaClient();
		// try {
		// 	const teamWithMembers = await prisma.team.findUnique({
		// 		where: {id: team.id},
		// 		include: {members: true, submissions: {orderBy: {submittedAt: 'desc'}}},
		// 		rejectOnNotFound: true,
		// 	});

		// 	return {
		// 		props: {
		// 			team: parseTeamWithMembersAndSubmissionToJson(teamWithMembers),
		// 			canSubmit: new Date() < PARTICIPANT_SUBMISSION_DEADLINE,
		// 		},
		// 	};
		// } catch {
		// 	return {
		// 		redirect: {
		// 			destination: '/login',
		// 			permanent: false,
		// 		},
		// 	};
		// }
	},
	sessionOptions,
);

export default JuryHomePage;
