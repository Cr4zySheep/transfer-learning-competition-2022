import React from 'react';
import {
	Button,
	Container,
	Grid,
	Typography,
	Link as MuiLink,
} from '@mui/material';
import {JURY_END_DATETIME, JURY_START_DATETIME} from 'consts';
import {withIronSessionSsr} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {NextPage} from 'next';
import Link from 'next/link';
import {getNbEvaluationsDone} from 'lib/jury';

interface JuryHomePageProps {
	active: boolean;
	initialNbEvaluationsDone: number;
}

const JuryHomePage: NextPage<JuryHomePageProps> = ({
	active,
	initialNbEvaluationsDone,
}) => {
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
				Thank you for helping us review the top 3 of this competition&apos;s two
				leaderboards.
				<br />
				Please read the following instructions document :{' '}
				<MuiLink href="https://transfer-learning.org/evaluation_tutorial">
					https://transfer-learning.org/evaluation_tutorial
				</MuiLink>{' '}
				<br />
				Then, click the button below to start evaluating !
			</Typography>

			<Typography paragraph>
				Number of evaluations done: {initialNbEvaluationsDone}
			</Typography>

			<Link passHref href="/jury/evaluation">
				<Button variant="contained" disabled={!active}>
					Start evaluating
				</Button>
			</Link>
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
				initialNbEvaluationsDone: await getNbEvaluationsDone(jury.id),
			},
		};
	},
	sessionOptions,
);

export default JuryHomePage;
