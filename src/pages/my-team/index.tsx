import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Grid,
	LinearProgress,
	Link as MUILink,
	List,
	ListItem,
	Paper,
	Snackbar,
	Typography,
} from '@mui/material';
import {withIronSessionSsr} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {Formik, Form} from 'formik';
import Link from 'next/link';
import {
	parseTeamWithMembersAndSubmissionToJson,
	transformJsonToTeamWithMembersAndSubmissions,
} from 'lib/team';
import {getNbRemainingEvaluations} from 'lib/teamBack';
import {NextPage} from 'next';
import React, {useState} from 'react';
import {TeamWithMembersAndSubmissionsJson} from 'types';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import FileUploadField from 'components/FileUploadField';
import {postSubmission} from 'services/team';
import * as yup from 'yup';
import CheckboxField from 'components/Checkbox';
import {
	NB_MAX_SUBMISSIONS,
	PARTICIPANT_EVALUATION_END,
	PARTICIPANT_EVALUATION_START,
	PARTICIPANT_SUBMISSION_DEADLINE,
} from 'consts';
import prisma from 'db';

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
	canSubmit: boolean;
	canEvaluate: boolean;
	initialNbOfEvaluations: number;
}

interface PostSubmissionData {
	submission: File | null;
}

const schema = yup.object({
	submission: yup.mixed().required(''),
	acceptRules: yup.boolean().required().oneOf([true], 'This is mandatory.'),
	rightCession: yup.boolean().required().oneOf([true], 'This is mandatory.'),
	validFormat: yup.boolean().required().oneOf([true], 'This is mandatory.'),
});

interface PostSubmissionConfirmationDialogProps {
	open: boolean;
	onClose: () => void;
	onConfirm: () => void;
}

const PostSubmissionConfirmationDialog: React.FC<
	PostSubmissionConfirmationDialogProps
> = ({open, onClose, onConfirm}) => (
	<Dialog fullWidth open={open} onClose={onClose}>
		<DialogTitle>
			Your team already has {NB_MAX_SUBMISSIONS} submissions !
		</DialogTitle>
		<DialogContent>
			<DialogContentText>
				If you press &quot;Continue submitting&quot;, your new submission will
				be sent and your oldest submission will be deleted.
				<br />
				<br />
				Press &quot;Abort&quot; to abort sending this new submission.
			</DialogContentText>
		</DialogContent>
		<DialogActions sx={{paddingLeft: 3, paddingRight: 3}}>
			<Grid container justifyContent="space-between">
				<Grid item>
					<Button variant="outlined" onClick={onClose}>
						Abort
					</Button>
				</Grid>
				<Grid item>
					<Button variant="contained" onClick={onConfirm}>
						Continue submitting
					</Button>
				</Grid>
			</Grid>
		</DialogActions>
	</Dialog>
);

const MyTeamPage: NextPage<MyTeamPageProps> = ({
	canSubmit,
	canEvaluate,
	initialNbOfEvaluations,
	...props
}) => {
	const [team, setTeam] = useState(
		transformJsonToTeamWithMembersAndSubmissions(props.team),
	);
	const [progress, setProgress] = useState(0);
	const [error, setError] = useState('');
	const [showPopup, setShowPopup] = useState(false);
	const [showProgressDialog, setShowProgressDialog] = useState(false);
	const [showSnackbar, setShowSnackbar] = useState(false);

	const nbRemainingEvaluations = initialNbOfEvaluations;

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

			{canSubmit && (
				<>
					<Typography gutterBottom variant="h2">
						Submissions
					</Typography>
					<Typography paragraph variant="body2" color="textSecondary">
						We keep up to 3 submissions for each competing team. If you upload a
						new submission while already having 3 former submissions, the oldest
						submission for your team will be deleted automatically.
					</Typography>
					<Formik
						initialValues={{
							submission: null,
							acceptRules: false,
							rightCession: false,
							validFormat: false,
						}}
						validationSchema={schema}
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
										].slice(0, NB_MAX_SUBMISSIONS),
									});
									setShowSnackbar(true);
								})
								.catch(() => {
									setError('An error occured during the upload.');
								})
								.finally(() => {
									setShowProgressDialog(false);
								});
						}}
					>
						{({values, isSubmitting, submitForm, errors, isValid}) => (
							<Form
								onKeyDown={(event) => {
									// Prevent submitting the form by pressing Enter.
									if ((event.charCode || event.keyCode) === 13) {
										event.preventDefault();
									}
								}}
							>
								<Grid container spacing={2}>
									<Grid item sm={values.submission ? 9 : 12}>
										<FileUploadField
											name="submission"
											disabled={isSubmitting}
										/>
									</Grid>
									{values.submission && (
										<Grid item sm={3}>
											<Button
												fullWidth
												variant="contained"
												disabled={isSubmitting || !isValid}
												onClick={async () => {
													// Check if there is no errors, ie errors is an empty object {}
													if (
														Object.keys(errors).length === 0 &&
														team.submissions.length >= NB_MAX_SUBMISSIONS
													) {
														setShowPopup(true);
													} else {
														setShowProgressDialog(true);
														await submitForm();
													}
												}}
											>
												Post submission
											</Button>
											<PostSubmissionConfirmationDialog
												open={showPopup}
												onClose={() => {
													setShowPopup(false);
												}}
												onConfirm={async () => {
													setShowPopup(false);
													setShowProgressDialog(true);
													await submitForm();
												}}
											/>
										</Grid>
									)}
								</Grid>
								{!isSubmitting && (
									<>
										<CheckboxField
											name="acceptRules"
											label={
												<>
													You have verified that all the members of your team
													have read and accepted the{' '}
													<MUILink
														href="https://transfer-learning.org/rules"
														target="__blank"
													>
														rules of the competition
													</MUILink>
													.
												</>
											}
										/>
										<CheckboxField
											name="rightCession"
											label={
												<>
													<b>In particular</b>, you have verified that all the
													members of your team have read and accepted the{' '}
													<MUILink
														href="https://drive.google.com/file/d/156CQYvpz6ARe1ic6gLT-eG7m5tqvyXAD/view?usp=share_link"
														target="__blank"
													>
														cession of rights related to your submission
													</MUILink>
													.
												</>
											}
										/>
										<CheckboxField
											name="validFormat"
											label={
												<>
													You are aware of our{' '}
													<MUILink
														href="https://transfer-learning.org/submissionguide"
														target="__blank"
													>
														submission guide
													</MUILink>{' '}
													and have checked that your submission follows the
													requested format.
												</>
											}
										/>
									</>
								)}

								<Dialog fullWidth open={showProgressDialog}>
									<DialogTitle>
										Don&apos;t close this tab until this popup disappears.
									</DialogTitle>
									<DialogContent>
										<DialogContentText>
											This process may takes a few minutes.
										</DialogContentText>

										{progress < 100 ? (
											<>
												<LinearProgressWithLabel value={progress} />
												<Typography
													variant="body2"
													color="textSecondary"
													sx={{marginTop: 1, fontStyle: 'italic'}}
												>
													Uploading file ...
												</Typography>
											</>
										) : (
											<Grid
												container
												alignItems="center"
												sx={{paddingTop: 2}}
												flexDirection="column"
											>
												<CircularProgress size={72} />
												<Typography
													variant="body2"
													color="textSecondary"
													sx={{marginTop: 1, fontStyle: 'italic'}}
												>
													Saving file ...
												</Typography>
											</Grid>
										)}
									</DialogContent>
								</Dialog>

								{error && (
									<Typography variant="body2" color="error">
										{error}
									</Typography>
								)}
							</Form>
						)}
					</Formik>
				</>
			)}

			{canEvaluate && (
				<>
					<Typography gutterBottom variant="h4">
						Evaluation
					</Typography>
					{nbRemainingEvaluations > 0 ? (
						<>
							<Typography paragraph>
								Before your submission is accepted, you need to help us with the
								evaluation procedure.
								<br />
								Please read the following instructions document :{' '}
								<MUILink href="https://transfer-learning.org/evaluation_tutorial">
									https://transfer-learning.org/evaluation_tutorial
								</MUILink>
								<br />
								Then, click the button below to start evaluating !
							</Typography>
							<Typography paragraph>
								Remaining evaluations: {nbRemainingEvaluations}
							</Typography>
							<Link passHref href="/my-team/evaluation">
								<Button variant="outlined">Evaluate some samples</Button>
							</Link>
						</>
					) : (
						<Typography paragraph>
							Your team has evaluated enough samples in order to qualify.
						</Typography>
					)}
				</>
			)}

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
			<Snackbar
				open={showSnackbar}
				onClose={() => {
					setShowSnackbar(false);
				}}
			>
				<Alert severity="success">Submission successful!</Alert>
			</Snackbar>

			<Typography gutterBottom variant="h2">
				Information
			</Typography>
			<Typography paragraph>
				Having an issue ? A question ? Send us an email in English or in French
				:{' '}
				<MUILink href="mailto:transferlearning.event@gmail.com">
					transferlearning.event@gmail.com
				</MUILink>
			</Typography>

			<Typography paragraph>
				<Typography color="error" component="span">
					Submission deadline :
				</Typography>{' '}
				Midnight (Paris time) in the night between APRIL 5th and APRIL 6th
			</Typography>

			<Typography paragraph>
				<MUILink href="https://transfer-learning.org/rules" target="__blank">
					Competition rules
				</MUILink>
			</Typography>

			<Typography paragraph>
				Download the dataset : click{' '}
				<MUILink
					href="https://drive.google.com/drive/folders/1-R1863MV8CuCjmycsLy05Uc6bdkWfuOP?usp=sharing"
					target="__blank"
				>
					this
				</MUILink>
				, then right click CeterisParibusDataset.zip and select
				&quot;Download&quot;.
			</Typography>

			<Typography paragraph>
				<MUILink
					href="https://transfer-learning.org/submissionguide"
					target="__blank"
				>
					Guide to send a submission
				</MUILink>
			</Typography>

			<Typography paragraph>
				More information may be displayed here in the future, keep an eye open
				;)
			</Typography>
		</Container>
	);
};

export const getServerSideProps = withIronSessionSsr(async ({req: request}) => {
	const team = request.session.team;

	if (!team) {
		return {
			redirect: {
				destination: '/login',
				permanent: false,
			},
		};
	}

	try {
		const teamWithMembers = await prisma.team.findUnique({
			where: {id: team.id},
			include: {members: true, submissions: {orderBy: {submittedAt: 'desc'}}},
			rejectOnNotFound: true,
		});

		const now = new Date();

		return {
			props: {
				team: parseTeamWithMembersAndSubmissionToJson(teamWithMembers),
				canSubmit: now < PARTICIPANT_SUBMISSION_DEADLINE,
				canEvaluate:
					PARTICIPANT_EVALUATION_START <= now &&
					now <= PARTICIPANT_EVALUATION_END,
				initialNbOfEvaluations: await getNbRemainingEvaluations(team.id),
			},
		};
	} catch {
		return {
			redirect: {
				destination: '/login',
				permanent: false,
			},
		};
	}
}, sessionOptions);

export default MyTeamPage;
