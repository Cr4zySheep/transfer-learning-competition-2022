import React from 'react';
import {withIronSessionSsr} from 'iron-session/next';
import {Container, Paper, Typography} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import {sessionOptions} from 'lib/session';

const LogoutPage = () => {
	return (
		<Container
			maxWidth="sm"
			sx={(theme) => ({
				paddingTop: theme.spacing(5),
			})}
		>
			<Paper
				variant="outlined"
				sx={(theme) => ({
					padding: theme.spacing(1),
					borderRadius: theme.spacing(1),
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					boxShadow: theme.shadows[5],
				})}
			>
				<CheckCircleOutlineIcon sx={{fontSize: 72}} color="success" />
				<Typography variant="h6">
					You&apos;ve been logged out successfully!
				</Typography>
			</Paper>
		</Container>
	);
};

export default LogoutPage;

export const getServerSideProps = withIronSessionSsr(async ({req: request}) => {
	request.session.destroy();
	return {props: {}};
}, sessionOptions);
