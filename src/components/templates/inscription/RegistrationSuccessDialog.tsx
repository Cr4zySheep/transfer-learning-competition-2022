import React from 'react';
import {
	Button,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Link,
} from '@mui/material';

interface RegistrationSuccessDialogProps {
	open: boolean;
}

const RegistrationSuccessDialog = ({open}: RegistrationSuccessDialogProps) => {
	return (
		<Dialog fullWidth open={open} maxWidth="sm">
			<DialogTitle>Registration successfull!</DialogTitle>
			<DialogContent>
				<DialogContentText>
					You can read carefully the information about the competition by
					clicking the button below.
				</DialogContentText>
			</DialogContent>
			<DialogActions>
				<Button
					fullWidth
					variant="contained"
					component={Link}
					href="https://transfer-learning.org/info"
				>
					See more information
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default RegistrationSuccessDialog;
