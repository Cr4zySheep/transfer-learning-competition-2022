import {
	Box,
	Button,
	Container,
	Grid,
	LinearProgress,
	List,
	ListItem,
	Paper,
	Typography,
} from '@mui/material';
import {PrismaClient} from '@prisma/client';
import {withIronSessionSsr} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {Formik, Form} from 'formik';
import {
	parseTeamWithMembersAndSubmissionToJson,
	transformJsonToTeamWithMembersAndSubmissions,
} from 'lib/team';
import {NextPage} from 'next';
import React, {useState} from 'react';
import {TeamWithMembersAndSubmissionsJson} from 'types';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import Link from 'next/link';
import FileUploadField from 'components/FileUploadField';
import {postSubmission} from 'services/team';

const LinearProgressWithLabel = (props: {value: number}) => {
	return (
		<Box sx={{display: 'flex', alignItems: 'center', marginTop: 1}}>
			<Box sx={{width: '100%', mr: 1}}>
				<LinearProgress variant="determinate" {...props} />
			</Box>
			<Box sx={{minWidth: 35}}>
				<Typography variant="body2" color="text.secondary">{`${Math.round(
					props.value,
				)}%`}</Typography>
			</Box>
		</Box>
	);
};

interface MyTeamPageProps {
	team: TeamWithMembersAndSubmissionsJson;
}

interface PostSubmissionData {
	submission: File | null;
}

const MyTeamPage: NextPage<MyTeamPageProps> = (props) => {
	const [team, setTeam] = useState(
		transformJsonToTeamWithMembersAndSubmissions(props.team),
	);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState('');

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
			<Formik
				initialValues={{submission: null}}
				onSubmit={async (values: PostSubmissionData, {resetForm}) => {
					if (!values.submission) return Promise.resolve();

					setProgress(0);
					return postSubmission(values.submission, (event) => {
						setProgress(Math.round((event.loaded * 100) / event.total));
					})
						.then((submission) => {
							resetForm();
							setTeam({
								...team,
								submissions: [
									{
										...submission,
										submittedAt: new Date(submission.submittedAt),
									},
									...team.submissions,
								],
							});
						})
						.catch(() => {
							setError('An error occured during the upload.');
						});
				}}
			>
				{({values, isSubmitting}) => (
					<Form>
						<Grid container spacing={2}>
							<Grid item sm={values.submission ? 9 : 12}>
								<FileUploadField name="submission" disabled={isSubmitting} />
							</Grid>
							{values.submission && (
								<Grid item sm={3}>
									<Button
										fullWidth
										variant="contained"
										type="submit"
										disabled={isSubmitting}
									>
										Post submission
									</Button>
								</Grid>
							)}
						</Grid>
						{isSubmitting && <LinearProgressWithLabel value={progress} />}
						{error && (
							<Typography variant="body2" color="error">
								{error}
							</Typography>
						)}
					</Form>
				)}
			</Formik>

			<Typography variant="h4" sx={{marginTop: 2}}>
				Submissions history
			</Typography>
			<List>
				{team.submissions.map((submission) => (
					<ListItem key={submission.id}>
						{submission.submittedAt.toLocaleString()}
					</ListItem>
				))}
			</List>
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
				include: {members: true, submissions: {orderBy: {submittedAt: 'desc'}}},
				rejectOnNotFound: true,
			});

			return {
				props: {
					team: parseTeamWithMembersAndSubmissionToJson(teamWithMembers),
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
