import React, {useState} from 'react';
import {
	Button,
	Container,
	Divider,
	Paper,
	Theme,
	Typography,
	useMediaQuery,
} from '@mui/material';
import {Formik, Form} from 'formik';
import TextField from 'components/TextField';
import {ForgottenPasswordData, forgottenPasswordSchema} from 'schemas/auth';
import {forgottenPassword} from 'services/auth';
import {sessionOptions} from 'lib/session';

import {withIronSessionSsr} from 'iron-session/next';

const initialValues: ForgottenPasswordData = {
	email: '',
};

const ForgottenPassword = () => {
	const isMobile = useMediaQuery<Theme>((theme) =>
		theme.breakpoints.down('sm'),
	);

	const [demandSent, setDemandSent] = useState(false);

	const handleSubmit = async (values: ForgottenPasswordData) => {
		return forgottenPassword(values).finally(() => {
			setDemandSent(true);
		});
	};

	const Wrapper = isMobile
		? React.Fragment
		: ({children}: any) => (
				<Paper
					variant="outlined"
					sx={(theme) => ({
						padding: theme.spacing(1),
						borderRadius: theme.spacing(1),
						boxShadow: theme.shadows[5],
					})}
				>
					{children}
				</Paper>
		  );

	return (
		<Container
			maxWidth="sm"
			sx={(theme) => ({
				paddingTop: theme.spacing(5),
			})}
		>
			<Wrapper>
				<Typography variant="h6" align="center">
					Forgotten password
				</Typography>
				<Divider sx={{marginBottom: 2, marginTop: 1}} />

				{demandSent ? (
					<Typography>
						A email has been sent to you with the instructions to reset your
						password.
					</Typography>
				) : (
					<Formik
						initialValues={initialValues}
						validationSchema={forgottenPasswordSchema}
						onSubmit={handleSubmit}
					>
						{({status}) => (
							<Form>
								<Typography paragraph variant="body1">
									Are you sure that no one in your team knows the password?
								</Typography>
								<TextField
									fullWidth
									name="email"
									label="Email address of one member of your team"
								/>
								<Button fullWidth variant="contained" type="submit">
									Ask to reset your team password
								</Button>

								{Boolean(status) && (
									<Typography gutterBottom color="error" sx={{marginTop: 1}}>
										{status}
									</Typography>
								)}
							</Form>
						)}
					</Formik>
				)}
			</Wrapper>
		</Container>
	);
};

export default ForgottenPassword;

export const getServerSideProps = withIronSessionSsr(async ({req}) => {
	const team = req.session.team;

	if (team) return {redirect: {destination: '/my-team', permanent: false}};

	return {props: {}};
}, sessionOptions);
