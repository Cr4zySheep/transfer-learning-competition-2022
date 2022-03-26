import {
	Button,
	Container,
	Divider,
	Paper,
	Theme,
	Typography,
	useMediaQuery,
} from '@mui/material';
import axios from 'axios';
import TextField from 'components/TextField';
import {Form, Formik} from 'formik';
import Link from 'next/link';
import {useRouter} from 'next/router';
import React, {useState} from 'react';
import {resetPasswordSchema} from 'schemas/auth';
import {resetPassword} from 'services/jury';

const ResetPasswordPage = () => {
	const router = useRouter();
	const {token} = router.query;

	const [demandSent, setDemandSent] = useState(false);

	const isMobile = useMediaQuery<Theme>((theme) =>
		theme.breakpoints.down('sm'),
	);

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
					Reset password
				</Typography>
				<Divider sx={{marginBottom: 2, marginTop: 1}} />

				{demandSent ? (
					<>
						<Typography>Password changed with success!</Typography>
						<Link passHref href="/jury/login">
							<Button fullWidth variant="contained" sx={{marginTop: 2}}>
								Go to the login page
							</Button>
						</Link>
					</>
				) : (
					<Formik
						initialValues={{password: '', token}}
						validationSchema={resetPasswordSchema}
						onSubmit={async (values, {setErrors, setStatus}) => {
							// @ts-expect-error token can only be a string
							return resetPassword(values)
								.then(() => {
									setDemandSent(true);
								})
								.catch((error) => {
									if (
										axios.isAxiosError(error) &&
										error.response?.status === 400
									) {
										setErrors(error.response.data);
									} else {
										setStatus('This link is invalid.');
									}
								});
						}}
					>
						{({status}) => (
							<Form>
								<TextField
									fullWidth
									name="password"
									label="New password"
									type="password"
								/>
								<Button fullWidth variant="contained" type="submit">
									Reset your assword
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

export default ResetPasswordPage;
