import React from 'react';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import {Box} from '@mui/material';

const Copyright = () => {
	return (
		<>
			<Divider />
			<Box sx={(theme) => ({padding: theme.spacing(2, 0)})}>
				<Typography variant="body2" color="text.secondary" align="center">
					Developed by Loïc MURA, have fun!
				</Typography>
			</Box>
		</>
	);
};

export default Copyright;
