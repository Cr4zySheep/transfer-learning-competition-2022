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
	FormControlLabel,
	FormGroup,
	Grid,
	Switch,
	Typography,
} from '@mui/material';
import {NextPage} from 'next';
import Link from 'next/link';
import {withIronSessionSsr} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {ControlPairCandidate, EvaluationCriteria} from '@prisma/client';
import Image from 'next/image';
import {VARIATION_TEXTS} from 'consts';
import Head from 'next/head';
import {useRouter} from 'next/router';
import {
	chooseControlPairCandidate,
	fetchNextControlPairs,
} from 'services/controlPairs';
import CriteriaInformationDialog from 'components/CriteriaInformationDialog';
import prisma from 'db';

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
	initialNbControlPairs: number;
}

const EvaluationPage: NextPage<EvaluationPageProps> = ({
	initialNbControlPairs,
}) => {
	const [nbControlPairs, setNbControlPairs] = useState(initialNbControlPairs);
	const name = useRouter().query.name as string;
	const [showInstructions, setShowInstructions] = useState(true);
	const [showCriteriaDialog, setShowCriteriaDialog] = useState(true);

	const [fetchedControlPairCandidates, setFetchedControlPairCandidates] =
		useState<ControlPairCandidate[]>([]);

	const [goodCandidate, setGoodCandidate] = useState(false);

	useEffect(() => {
		if (fetchedControlPairCandidates.length < 2) {
			fetchNextControlPairs(name, fetchedControlPairCandidates[0]?.id)
				.then((data) => {
					setFetchedControlPairCandidates([
						...fetchedControlPairCandidates,
						data,
					]);
				})
				.catch((error) => {
					console.error(error);
				});
		}
	}, [fetchedControlPairCandidates, name]);

	const currentEvaluation = fetchedControlPairCandidates[0];
	const nextEvaluation = fetchedControlPairCandidates[1];

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

		chooseControlPairCandidate(
			currentEvaluation.id,
			name,
			choice,
			goodCandidate,
		)
			.then((x) => {
				setNbControlPairs(x);
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

		setGoodCandidate(false);
		setFetchedControlPairCandidates((previousFetchedEvaluations) =>
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
							Number of control pairs: {nbControlPairs}
						</Typography>

						<Grid item>
							<Link passHref href="/admin">
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
									<FormGroup>
										<FormControlLabel
											control={
												<Switch
													checked={goodCandidate}
													onChange={(_, value) => {
														setGoodCandidate(value);
													}}
												/>
											}
											label="Good control pair"
										/>
									</FormGroup>
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

export const getServerSideProps = withIronSessionSsr(
	async ({req: request, params}) => {
		if (
			!params?.name ||
			!['nicolas', 'jules'].includes(params.name as string)
		) {
			return {redirect: {destination: '/admin', permanent: false}};
		}

		if (!request.session.admin) {
			return {
				redirect: {
					destination: '/admin/login',
					permanent: false,
				},
			};
		}

		try {
			const initialNbControlPairs = await prisma.controlPair.count();

			return {props: {initialNbControlPairs}};
		} catch {
			return {
				redirect: {
					destination: '/admin/login',
					permanent: false,
				},
			};
		}
	},
	sessionOptions,
);

export default EvaluationPage;
