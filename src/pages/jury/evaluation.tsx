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
import {JURY_END_DATETIME, JURY_START_DATETIME, VARIATION_TEXTS} from 'consts';
import Head from 'next/head';
import {getNbEvaluationsDone} from 'lib/jury';
import CriteriaInformationDialog from 'components/CriteriaInformationDialog';

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

interface EvaluationPageProps {
	initialNbEvaluationsDone: number;
}

const EvaluationPage: NextPage<EvaluationPageProps> = ({
	initialNbEvaluationsDone,
}) => {
	const [nbEvaluationsDone, setNbEvaluationsDone] = useState(
		initialNbEvaluationsDone,
	);
	const [showInstructions, setShowInstructions] = useState(true);
	const [showCriteriaDialog, setShowCriteriaDialog] = useState(true);

	const [fetchedEvaluations, setFetchedEvaluations] = useState<Evaluation[]>(
		[],
	);

	useEffect(() => {
		if (fetchedEvaluations.length < 2) {
			fetchNextAssignedEvaluations(fetchedEvaluations[0]?.id)
				.then((data) => {
					setFetchedEvaluations([...fetchedEvaluations, data]);
				})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [fetchedEvaluations]);

	const currentEvaluation = fetchedEvaluations[0];
	const nextEvaluation = fetchedEvaluations[1];

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

		chooseEvaluation(currentEvaluation.id, choice)
			.then((x) => {
				setNbEvaluationsDone(x);
			})
			.catch((error) => {
				console.error(error);
			});

		if (
			currentEvaluation.evaluationCriteria !==
			nextEvaluation?.evaluationCriteria
		) {
			setShowCriteriaDialog(true);
		}

		setFetchedEvaluations((previousFetchedEvaluations) =>
			previousFetchedEvaluations.slice(1),
		);

		setDisabled(true);
		timeoutRef.current = setTimeout(() => {
			setDisabled(false);
		}, 1000);
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
							Number of evaluations done: {nbEvaluationsDone}
						</Typography>

						<Grid item>
							<Link passHref href="/jury">
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
										src={`/media/dataset/${
											currentEvaluation.name.split('/')[0]
										}.png`}
										style={{width: '100%'}}
									/>
									<Typography paragraph>{currentEvaluation.name}</Typography>
									<Typography paragraph>
										Criteria:{' '}
										{currentEvaluation.evaluationCriteria ===
										EvaluationCriteria.CRITERIA_0
											? 'face realism'
											: 'edition quality'}
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
	if (!request.session.jury) {
		return {
			redirect: {
				destination: '/jury/login',
				permanent: false,
			},
		};
	}

	const now = new Date();
	if (now < JURY_START_DATETIME || now > JURY_END_DATETIME) {
		return {
			redirect: {
				destination: '/jury',
				permanent: false,
			},
		};
	}

	try {
		const nbEvaluationsDone = await getNbEvaluationsDone(
			request.session.jury.id,
		);

		return {props: {initialNbEvaluationsDone: nbEvaluationsDone}};
	} catch {
		return {
			redirect: {
				destination: '/jury/login',
				permanent: false,
			},
		};
	}
}, sessionOptions);

export default EvaluationPage;
