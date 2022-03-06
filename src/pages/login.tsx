import React from 'react';
import {
	Box,
	Button,
	Container,
	Divider,
	Link,
	Paper,
	Theme,
	Typography,
	useMediaQuery,
} from '@mui/material';
import {Formik, Form, FormikHelpers} from 'formik';
import TextField from 'components/TextField';
import NextLink from 'next/link';
import loginSchema, {LoginData} from 'schemas/auth';
import {login} from 'services/auth';
import {useRouter} from 'next/router';
import {sessionOptions} from 'lib/session';

import {withIronSessionSsr} from 'iron-session/next';

const initialValues: LoginData = {
	email: '',
	password: '',
};

const Login = () => {
	const router = useRouter();
	const isMobile = useMediaQuery<Theme>((theme) =>
		theme.breakpoints.down('sm'),
	);
	const handleSubmit = async (
		values: LoginData,
		{setStatus}: FormikHelpers<LoginData>,
	) => {
		return login(values)
			.then(async () => router.push('/my-team'))
			.catch(() => {
				setStatus(
					"Either invalid email address and password combination, or you haven't validated your email address.",
				);
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
					Sign in
				</Typography>
				<Divider sx={{marginBottom: 2, marginTop: 1}} />

				<Formik
					initialValues={initialValues}
					validationSchema={loginSchema}
					onSubmit={handleSubmit}
				>
					{({status}) => (
						<Form>
							<TextField
								fullWidth
								name="email"
								label="Email address of one member of your team"
								sx={{minHeight: 84}}
							/>
							<TextField
								fullWidth
								name="password"
								label="Password of your team"
								type="password"
								sx={{minHeight: 84}}
							/>
							<Button fullWidth variant="contained" type="submit">
								Sign in
							</Button>

							{Boolean(status) && (
								<Typography gutterBottom color="error" sx={{marginTop: 1}}>
									{status}
								</Typography>
							)}
						</Form>
					)}
				</Formik>

				<Box sx={{marginTop: 1}}>
					<NextLink passHref href="/register">
						<Link underline="hover" variant="body2">
							Not registered yet?
						</Link>
					</NextLink>
					{/* <br />
					<NextLink passHref href="/forgotten-password">
						<Link underline="hover" variant="body2">
							Reset your password?
						</Link>
					</NextLink> */}
				</Box>
			</Wrapper>
		</Container>
	);
};

export default Login;

// TODO: Reset your password

export const getServerSideProps = withIronSessionSsr(async ({req}) => {
	const team = req.session.team;

	if (team) return {redirect: {destination: '/my-team', permanent: false}};

	return {props: {}};
}, sessionOptions);
