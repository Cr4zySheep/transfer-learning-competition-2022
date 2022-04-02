import React from 'react';
import {
	DialogProps,
	Dialog,
	DialogTitle,
	DialogActions,
	Button,
	DialogContent,
	DialogContentText,
} from '@mui/material';
import {EvaluationCriteria} from '@prisma/client';

interface CriteriaInformationDialogProps extends DialogProps {
	criteria: EvaluationCriteria;
}

const CriteriaInformationDialog: React.FunctionComponent<
	CriteriaInformationDialogProps
> = ({criteria, ...props}) => {
	return (
		<Dialog {...props} fullWidth maxWidth="sm">
			<DialogTitle>Criteria: {criteria}</DialogTitle>

			<DialogContent>
				<DialogContentText>
					Be careful ! In this next series of images, you will need to evaluate
					based on{' '}
					<strong>
						{criteria === EvaluationCriteria.CRITERIA_0
							? 'face realism'
							: 'edition quality'}
					</strong>
					.
				</DialogContentText>
			</DialogContent>

			<DialogActions>
				<Button
					variant="contained"
					onClick={() => {
						props.onClose?.({}, 'backdropClick');
					}}
				>
					Continue
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export default CriteriaInformationDialog;
