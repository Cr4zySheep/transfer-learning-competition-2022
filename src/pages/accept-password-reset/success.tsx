import React from 'react';
import {Container, Paper, Typography} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

const TokenSuccess = () => {
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
				<Typography variant="h6">Permission given with success!</Typography>
			</Paper>
		</Container>
	);
};

export default TokenSuccess;
