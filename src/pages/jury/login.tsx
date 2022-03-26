import React from 'react';
import {
	Button,
	Container,
	Divider,
	Paper,
	Theme,
	Typography,
	useMediaQuery,
} from '@mui/material';
import {Formik, Form, FormikHelpers} from 'formik';
import TextField from 'components/TextField';
import {loginSchema, LoginData} from 'schemas/auth';
import {login} from 'services/jury';
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
			.then(async () => router.push('/jury'))
			.catch(() => {
				setStatus('Either invalid email address and password combination.');
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
								label="Email address"
								sx={{minHeight: 84}}
							/>
							<TextField
								fullWidth
								name="password"
								label="Password"
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

				{/* <Box sx={{marginTop: 1}}>
					<NextLink passHref href="/register">
						<Link underline="hover" variant="body2">
							Not registered yet?
						</Link>
					</NextLink>
					<br />
					<NextLink passHref href="/forgotten-password">
						<Link underline="hover" variant="body2">
							Reset your password?
						</Link>
					</NextLink>
				</Box> */}
			</Wrapper>
		</Container>
	);
};

export default Login;

export const getServerSideProps = withIronSessionSsr(async ({req}) => {
	const jury = req.session.jury;

	if (jury) return {redirect: {destination: '/jury', permanent: false}};

	return {props: {}};
}, sessionOptions);
