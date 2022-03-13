import React, {useState} from 'react';
import {
	Grid,
	Typography,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
} from '@mui/material';
import {useField} from 'formik';

import TextField from 'components/TextField';

import YearOfStudyField from './YearOfStudyField';

interface UniversityFormProps {
	prefix: string;
}

const UniversityForm = ({prefix}: UniversityFormProps) => {
	const [state, setState] = useState('');

	const meta = useField(prefix + 'university')[1];
	const helpers = useField(prefix + 'university')[2];

	return (
		<>
			<Grid container spacing={2}>
				<Grid item xs={state === 'Other' ? 6 : 12}>
					<FormControl fullWidth variant="standard" sx={{minHeight: 72}}>
						<InputLabel>University *</InputLabel>
						<Select
							value={state}
							onChange={(event) => {
								const value = event.target.value;
								setState(value);
								if (value === 'Other') helpers.setValue('');
								else helpers.setValue(value);
							}}
						>
							<MenuItem value="CentraleSupélec">CentraleSupélec</MenuItem>
							<MenuItem value="Centrale Marseille">Centrale Marseille</MenuItem>
							<MenuItem value="Centrale Lille">Centrale Lille</MenuItem>
							<MenuItem value="Other">Other</MenuItem>
						</Select>
					</FormControl>

					{state !== 'Other' && meta.touched && Boolean(meta.error) && (
						<Typography variant="caption" color="error">
							{meta.error}
						</Typography>
					)}
				</Grid>

				{state === 'Other' && (
					<Grid item xs={6}>
						<TextField
							fullWidth
							name={prefix + 'university'}
							variant="standard"
							label="Which one? *"
						/>
					</Grid>
				)}
			</Grid>

			{state && state !== 'Other' && <YearOfStudyField prefix={prefix} />}
		</>
	);
};

export default UniversityForm;
