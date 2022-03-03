import {Button, Container, Grid, Paper, Typography} from '@mui/material';
import {PrismaClient} from '@prisma/client';
import {withIronSessionSsr} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {
	parseTeamWithMembersToJson,
	transformJsonToTeamWithMembers,
} from 'lib/team';
import {NextPage} from 'next';
import React, {useMemo} from 'react';
import {TeamWithMembersJson} from 'types';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Link from 'next/link';

interface MyTeamPageProps {
	team: TeamWithMembersJson;
}

const MyTeamPage: NextPage<MyTeamPageProps> = (props) => {
	const team = useMemo(
		() => transformJsonToTeamWithMembers(props.team),
		[props.team],
	);

	return (
		<Container>
			<Grid container justifyContent="space-between" alignItems="baseline">
				<Typography gutterBottom variant="h1">
					My team
				</Typography>

				<Grid item>
					<Link passHref href="/logout">
						<Button variant="outlined">Log out</Button>
					</Link>
				</Grid>
			</Grid>

			<Typography gutterBottom variant="h2">
				Team members
			</Typography>
			<Grid container spacing={2} sx={{marginBottom: 5}}>
				{team.members.map((member) => (
					<Grid key={member.id} item sm={3}>
						<Paper sx={{padding: 1}}>
							<Typography>
								{member.firstName} {member.lastName}
							</Typography>
							<Typography sx={{display: 'flex'}}>
								{member.emailValidated ? (
									<CheckCircleOutlineIcon
										color="success"
										sx={{marginRight: 1}}
									/>
								) : (
									<ErrorOutlineIcon color="error" sx={{marginRight: 1}} />
								)}{' '}
								{member.email}
							</Typography>
						</Paper>
					</Grid>
				))}
			</Grid>

			<Typography gutterBottom variant="h2">
				Submissions
			</Typography>
		</Container>
	);
};

export const getServerSideProps = withIronSessionSsr(
	async ({req, res: response}) => {
		const team = req.session.team;

		if (!team) {
			response.statusCode = 302;
			response.setHeader('location', '/login');
			response.end();
			return {notFound: true};
		}

		const prisma = new PrismaClient();
		try {
			const teamWithMembers = await prisma.team.findUnique({
				where: {id: team.id},
				include: {members: true},
				rejectOnNotFound: true,
			});

			return {
				props: {
					team: parseTeamWithMembersToJson(teamWithMembers),
				},
			};
		} catch {
			response.statusCode = 302;
			response.setHeader('location', '/login');
			response.end();
			return {notFound: true};
		}
	},
	sessionOptions,
);

export default MyTeamPage;
