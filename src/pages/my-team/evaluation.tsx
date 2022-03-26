import React, {useState} from 'react';
import {
	Button,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogProps,
	DialogTitle,
	Grid,
	Typography,
} from '@mui/material';
import {NextPage} from 'next';
import Link from 'next/link';
import {withIronSessionSsr} from 'iron-session/next';
import {sessionOptions} from 'lib/session';

const InstructionsDialog = (props: DialogProps) => {
	return (
		<Dialog {...props} fullWidth maxWidth="sm">
			<DialogTitle>How to evaluate a sample?</DialogTitle>
			<DialogContent>
				<DialogContentText>TEXT TEXT</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					variant="contained"
					onClick={() => {
						props.onClose?.({}, 'backdropClick');
					}}
				>
					Start evaluating
				</Button>
			</DialogActions>
		</Dialog>
	);
};

const EvaluationPage: NextPage = () => {
	const [showInstructions, setShowInstructions] = useState(true);

	return (
		<>
			<InstructionsDialog
				open={showInstructions}
				onClose={() => {
					setShowInstructions(false);
				}}
			/>

			<Container>
				<Grid container justifyContent="space-between" alignItems="baseline">
					<Typography gutterBottom variant="h1">
						Evaluation
					</Typography>

					<Grid item>
						<Link passHref href="/logout">
							<Button variant="outlined">Log out</Button>
						</Link>
					</Grid>
				</Grid>

				<Typography color="textSecondary">Work in progress</Typography>
			</Container>
		</>
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

	// TODO: Use the true value for this
	const nbRemainingEvaluations = 5;

	if (nbRemainingEvaluations <= 0)
		return {
			redirect: {
				destination: '/my-team',
				permanent: false,
			},
		};

	return {props: {}};

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
}, sessionOptions);

export default EvaluationPage;
