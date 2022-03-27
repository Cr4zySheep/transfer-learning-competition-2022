import React, {useEffect, useState, useMemo, useRef} from 'react';
import {css} from '@emotion/react';
import {
	Button,
	CircularProgress,
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
import {
	chooseEvaluation,
	fetchNextAssignedEvaluations,
} from 'services/evaluations';
import {Evaluation, EvaluationCriteria} from '@prisma/client';
import Image from 'next/image';
import {getNbRemainingEvaluations} from 'lib/team';
import {PARTICIPANT_EVALUATION_END, VARIATION_TEXTS} from 'consts';
import Head from 'next/head';
import {useRouter} from 'next/router';

interface VariationDescProps {
	variation: string;
}

const VariationDesc: React.FunctionComponent<VariationDescProps> = ({
	variation,
}) => {
	const variationText = useMemo(() => {
		const texts = VARIATION_TEXTS[variation] || [];

		return texts.map(({text, bold}) => (bold ? <strong>{text}</strong> : text));
	}, [variation]);

	return <Typography>{variationText}</Typography>;
};

interface CriteriaInformationDialogProps extends DialogProps {
	criteria: EvaluationCriteria;
}

const CriteriaInformationDialog: React.FunctionComponent<
	CriteriaInformationDialogProps
> = ({criteria, ...props}) => {
	return (
		<Dialog {...props} fullWidth maxWidth="sm">
			<DialogTitle>Criteria: {criteria}</DialogTitle>

			{/* <DialogContent>
				<DialogContentText>TEXT TEXT</DialogContentText>
			</DialogContent> */}

			<DialogActions>
				<Button
					variant="contained"
					onClick={() => {
						props.onClose?.({}, 'backdropClick');
					}}
				>
					Continue
				</Button>
			</DialogActions>
		</Dialog>
	);
};

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

const TaskFinishedDialog = (props: DialogProps) => {
	const router = useRouter();

	return (
		<Dialog
			{...props}
			fullWidth
			maxWidth="sm"
			onClose={async () => {
				await router.push('/my-team');
			}}
		>
			<DialogTitle>Evaluation finished!</DialogTitle>
			<DialogContent>
				<DialogContentText>
					Your team has evaluated enough samples in order to qualify.
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Link passHref href="/my-team">
					<Button variant="contained">Continue</Button>
				</Link>
			</DialogActions>
		</Dialog>
	);
};

interface EvaluationPageProps {
	initialNbRemainingEvaluations: number;
}

const EvaluationPage: NextPage<EvaluationPageProps> = ({
	initialNbRemainingEvaluations,
}) => {
	const [nbRemainingEvaluations, setRemainingEvaluations] = useState(
		initialNbRemainingEvaluations,
	);
	const [showInstructions, setShowInstructions] = useState(true);
	const [showTaskFinishedDialog, setShowTaskFinishedDialog] = useState(false);
	const [showCriteriaDialog, setShowCriteriaDialog] = useState(true);

	const [fetchedEvaluations, setFetchedEvaluations] = useState<Evaluation[]>(
		[],
	);

	useEffect(() => {
		if (fetchedEvaluations.length < 2 && nbRemainingEvaluations > 0) {
			fetchNextAssignedEvaluations(fetchedEvaluations[0]?.id)
				.then((data) => {
					setFetchedEvaluations([...fetchedEvaluations, data]);
				})
				.catch(() => {});
		}
	}, [fetchedEvaluations, nbRemainingEvaluations]);

	const currentEvaluation = fetchedEvaluations[0];
	const nextEvaluation = fetchedEvaluations[1];

	console.log(currentEvaluation, nextEvaluation);

	const [disabled, setDisabled] = useState(false);
	const timeoutRef = useRef<NodeJS.Timeout>();

	useEffect(() => {
		return () => {
			// @ts-expect-error Wrong timeout type
			clearTimeout(timeoutRef.current);
		};
	}, []);

	const selectImage = async (choice: boolean): Promise<void> => {
		if (!currentEvaluation) return;

		setDisabled(true);
		const x = await chooseEvaluation(currentEvaluation.id, choice);
		setRemainingEvaluations(x);
		if (x > 0) {
			if (
				currentEvaluation.evaluationCriteria !==
				nextEvaluation?.evaluationCriteria
			) {
				setShowCriteriaDialog(true);
			}

			setFetchedEvaluations((previousFetchedEvaluations) =>
				previousFetchedEvaluations.slice(1),
			);

			timeoutRef.current = setTimeout(() => {
				setDisabled(false);
			}, 1000);
		} else {
			setShowTaskFinishedDialog(true);
		}
	};

	return (
		<>
			<Head>
				<title>Ceteris Paribus Face Challenge - Evaluating some samples</title>
			</Head>

			<InstructionsDialog
				open={showInstructions}
				onClose={() => {
					setShowInstructions(false);
				}}
			/>

			<TaskFinishedDialog open={showTaskFinishedDialog} />

			{currentEvaluation && (
				<CriteriaInformationDialog
					open={!showInstructions && showCriteriaDialog}
					criteria={currentEvaluation.evaluationCriteria}
					onClose={() => {
						setShowCriteriaDialog(false);
					}}
				/>
			)}

			<Grid
				container
				flexDirection="column"
				style={{minHeight: 'calc(100vh - 55px)'}}
			>
				<Container>
					<Grid
						container
						justifyContent="space-between"
						alignItems="baseline"
						sx={{paddingTop: 2, marginBottom: 2}}
					>
						<Typography variant="h4">
							Remaining evaluations: {Math.max(nbRemainingEvaluations, 0)}
						</Typography>

						<Grid item>
							<Link passHref href="/my-team">
								<Button variant="outlined">Stop evaluating</Button>
							</Link>
						</Grid>
					</Grid>
				</Container>

				<Grid item container style={{flexGrow: 1}} alignItems="center">
					{currentEvaluation && (
						<Grid container alignContent="center">
							<Grid item md={4} style={{position: 'relative'}}>
								<img
									loading="eager"
									src={`/media/team-${currentEvaluation.idTeamA}/${currentEvaluation.name}.png`}
									css={css`
										width: 100%;
										:hover {
											cursor: ${disabled ? 'not-allowed' : 'pointer'};
										}
									`}
									onClick={async () => {
										if (!disabled) await selectImage(false);
									}}
								/>
							</Grid>

							<Grid item md={4}>
								<div style={{width: '90%', margin: 'auto'}}>
									<img
										loading="eager"
										src={`/dataset/${currentEvaluation.name.split('/')[0]}.png`}
										style={{width: '100%'}}
									/>
									<Typography paragraph>{currentEvaluation.name}</Typography>
									<Typography paragraph>
										{currentEvaluation.evaluationCriteria}
									</Typography>
									<VariationDesc
										variation={currentEvaluation.name.split('/')[1]}
									/>
								</div>
							</Grid>

							<Grid item md={4} style={{position: 'relative'}}>
								<img
									loading="eager"
									src={`/media/team-${currentEvaluation.idTeamB}/${currentEvaluation.name}.png`}
									style={{}}
									css={css`
										width: 100%;
										:hover {
											cursor: ${disabled ? 'not-allowed' : 'pointer'};
										}
									`}
									onClick={async () => {
										if (!disabled) await selectImage(true);
									}}
								/>
								{/* <Image
							unoptimized
							loader={({src}) => src}
							layout="fill"
							objectFit="contain"
						/> */}
							</Grid>
						</Grid>
					)}

					{nextEvaluation && (
						<div style={{width: 0, height: 0, position: 'relative'}}>
							<Image
								unoptimized
								loading="lazy"
								loader={({src}) => src}
								layout="fill"
								objectFit="contain"
								src={`/media/team-${nextEvaluation.idTeamA}/${nextEvaluation.name}.png`}
								onClick={async () => selectImage(false)}
							/>
							<Image
								unoptimized
								loading="lazy"
								loader={({src}) => src}
								layout="fill"
								objectFit="contain"
								src={`/media/team-${nextEvaluation.idTeamB}/${nextEvaluation.name}.png`}
								onClick={async () => selectImage(false)}
							/>
						</div>
					)}

					{!currentEvaluation && (
						<Grid container justifyContent="center">
							<Grid item>
								<CircularProgress size={100} thickness={1.5} />
							</Grid>
						</Grid>
					)}
				</Grid>
			</Grid>
		</>
	);
};

export const getServerSideProps = withIronSessionSsr(async ({req: request}) => {
	// TODO: Add deadline for evaluations
	if (!request.session.team) {
		return {
			redirect: {
				destination: '/login',
				permanent: false,
			},
		};
	}

	const now = new Date();
	if (now > PARTICIPANT_EVALUATION_END) {
		return {
			redirect: {
				destination: '/my-team',
				permanent: false,
			},
		};
	}

	try {
		const nbRemainingEvaluations = await getNbRemainingEvaluations(
			request.session.team.id,
		);

		if (nbRemainingEvaluations <= 0)
			return {
				redirect: {
					destination: '/my-team',
					permanent: false,
				},
			};

		return {props: {initialNbRemainingEvaluations: nbRemainingEvaluations}};
	} catch {
		return {
			redirect: {
				destination: '/login',
				permanent: false,
			},
		};
	}
}, sessionOptions);

export default EvaluationPage;
