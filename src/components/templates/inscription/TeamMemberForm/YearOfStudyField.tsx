import React from 'react';
import {
	Typography,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
} from '@mui/material';
import {useField} from 'formik';

const YearOfStudyField = ({prefix}: {prefix: string}) => {
	const [field, meta] = useField(prefix + '.yearOfStudy');

	return (
		<FormControl fullWidth variant="standard" sx={{minHeight: 72}}>
			<InputLabel>Current year of study *</InputLabel>
			<Select {...field}>
				<MenuItem value="1A">First year</MenuItem>
				<MenuItem value="2A">Second year</MenuItem>
				<MenuItem value="3A">Third year</MenuItem>
			</Select>
			{meta.touched && Boolean(meta.error) && (
				<Typography variant="caption" color="error">
					{meta.error}
				</Typography>
			)}
		</FormControl>
	);
};

export default YearOfStudyField;
