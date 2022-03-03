import React from 'react';
import {Container, Paper, Typography} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const TokenError = () => {
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
				<ErrorOutlineIcon sx={{fontSize: 72}} color="error" />
				<Typography variant="h6">This link is invalid.</Typography>
			</Paper>
		</Container>
	);
};

export default TokenError;
