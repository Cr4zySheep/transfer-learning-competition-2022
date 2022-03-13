import React from 'react';
import {
	Typography,
	Button,
	Grid,
	Paper,
	FormControl,
	FormLabel,
	RadioGroup,
	FormControlLabel,
	Radio,
} from '@mui/material';
import {useField} from 'formik';

import TextField from 'components/TextField';

import UniversityForm from './UniversityForm';
import WorkerForm from './WorkerForm';

/**
+ Champs pour l'inscription (soit champ pour 4 personnes (s'il travaille => dans quelle boite (de façon optionnelle) et quel travail) et case à cocher "Si tout le monde a prétendu être en première année d'école, alors ils participeront à la compétition qu'entre première année)
+ Login / mdp (Mdp reset)
 */

interface TeamMemberFormProps {
	prefix: string;
	index: number;
	remove?: () => void;
}

const TeamMemberForm = ({prefix, index, remove}: TeamMemberFormProps) => {
	const [field, meta] = useField(prefix + 'isStudent');

	return (
		<Grid item xs={12} md={6}>
			<Paper sx={(theme) => ({padding: theme.spacing(1)})}>
				<Typography gutterBottom fontWeight="bold">
					Member #{index + 1}
				</Typography>
				<Grid container spacing={2}>
					<Grid item xs={12} md={6}>
						<TextField
							fullWidth
							name={prefix + 'firstName'}
							label="First name *"
							variant="standard"
						/>
					</Grid>
					<Grid item xs={12} md={6}>
						<TextField
							fullWidth
							name={prefix + 'lastName'}
							label="Last name *"
							variant="standard"
						/>
					</Grid>
				</Grid>

				<TextField
					fullWidth
					name={prefix + 'email'}
					label="Email address *"
					variant="standard"
				/>

				<div>
					<FormControl sx={(theme) => ({marginBottom: theme.spacing(1)})}>
						<FormLabel>Are you a student? *</FormLabel>

						<RadioGroup {...field}>
							<FormControlLabel
								value="YES"
								control={<Radio />}
								label="Yes, I am."
							/>
							<FormControlLabel
								value="NO"
								control={<Radio />}
								label="No, I am not."
							/>
						</RadioGroup>
					</FormControl>
				</div>

				{meta.touched && Boolean(meta.error) && (
					<Typography variant="caption" color="error">
						{meta.error}
					</Typography>
				)}

				{field.value === 'YES' && <UniversityForm prefix={prefix} />}

				{field.value === 'NO' && <WorkerForm prefix={prefix} />}

				{remove && (
					<Button
						fullWidth
						variant="contained"
						onClick={() => {
							remove();
						}}
					>
						Remove
					</Button>
				)}
			</Paper>
		</Grid>
	);
};

export default TeamMemberForm;
