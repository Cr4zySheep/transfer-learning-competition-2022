import React from 'react';
import type {NextPage} from 'next';
import {Button, Container, Grid, Typography} from '@mui/material';
import TextField from 'components/TextField';
import {Form, Formik} from 'formik';
import {adminLogin} from 'services/admin';
import {withIronSessionSsr} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {useRouter} from 'next/router';

const AdminPage: NextPage = () => {
	const router = useRouter();

	return (
		<Container>
			<Typography gutterBottom variant="h1">
				Admin panel
			</Typography>

			<Formik
				initialValues={{password: ''}}
				onSubmit={async ({password}, {setStatus}) => {
					return adminLogin(password)
						.then(async () => router.push('/admin'))
						.catch(() => {
							setStatus('Wrong password');
						});
				}}
			>
				{({status}) => (
					<Form>
						<Grid container spacing={2}>
							<Grid item xs={12} md={6}>
								<TextField
									fullWidth
									name="password"
									label="Password"
									variant="standard"
									type="password"
								/>
							</Grid>

							<Grid item xs={12} md={6}>
								<Button fullWidth type="submit" variant="contained">
									Access the admin panel
								</Button>
							</Grid>
						</Grid>
						{Boolean(status) && (
							<Typography color="error" variant="caption">
								{status}
							</Typography>
						)}
					</Form>
				)}
			</Formik>
		</Container>
	);
};

export default AdminPage;

export const getServerSideProps = withIronSessionSsr(async ({req}) => {
	const isAdmin = req.session.admin;

	if (isAdmin) return {redirect: {destination: '/admin', permanent: false}};

	return {props: {}};
}, sessionOptions);
