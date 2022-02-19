import React, {useState} from 'react';
import axios from 'axios';
import {Box, Button, Divider, Grid, Link, Typography} from '@mui/material';
import AddCircleRoundedIcon from '@mui/icons-material/AddCircleRounded';
import {
	Formik,
	Form,
	FieldArray,
	FieldArrayRenderProps,
	FormikHelpers,
	yupToFormErrors,
} from 'formik';

import schema, {universities} from 'schemas/teamRegistration';
import {register} from 'services/team';

import TextField from 'components/TextField';
import CheckboxField from 'components/Checkbox';
import TeamMemberForm from './TeamMemberForm';
import RegistrationSuccessDialog from './RegistrationSuccessDialog';

const emptyMember = {
	firstName: '',
	lastName: '',
	email: '',
	isStudent: '',
	university: '',
	yearOfStudy: '',
	companyName: '',
	companyRole: '',
};

const initialValues = {
	members: [emptyMember],
	password: '',
	acceptRules: false,
	acceptDataTreatment: false,
};

interface FormData {
	members: Array<{
		firstName: string;
		lastName: string;
		email: string;
		isStudent: string;
		university: string;
		yearOfStudy: string;
		companyName: string;
		companyRole: string;
	}>;
	password: string;
	acceptRules: boolean;
	acceptDataTreatment: boolean;
}

const TeamRegistrationForm = () => {
	const [showSuccessDialog, setShowSuccessDialog] = useState(false);

	const handleSubmit = async (
		values: FormData,
		{setErrors, setStatus}: FormikHelpers<FormData>,
	) => {
		// Check for duplicate email
		const emails = new Set(values.members.map((member) => member.email));
		if (emails.size !== values.members.length) {
			setStatus('Each member should have a different email address.');
			return Promise.resolve();
		}

		for (const member of values.members) {
			// Is student
			if (member.isStudent === 'YES') {
				member.companyName = '';
				member.companyRole = '';

				if (member.university && !universities.has(member.university)) {
					member.yearOfStudy = '';
				}
			}

			// Is worker
			if (member.isStudent === 'NO') {
				member.university = '';
				member.yearOfStudy = '';
			}
		}

		// Submit
		return register(values)
			.then(() => {
				setShowSuccessDialog(true);
			})
			.catch((error) => {
				if (axios.isAxiosError(error)) {
					if (error.response?.status === 400) {
						const errorData: unknown = error.response.data;
						if (typeof errorData === 'object') {
							setErrors(yupToFormErrors(error.response.data));
						} else if (typeof errorData === 'string') {
							// SetStatus(errorData);
							setStatus(
								'At least one of these email addresses is already used by another team.',
							);
						} else
							console.error('An error occured with unknown type :', errorData);
					}
				} else throw error;
			});
	};

	return (
		<Formik
			initialValues={initialValues}
			validationSchema={schema}
			onSubmit={handleSubmit}
		>
			{({values, status}) => (
				<Form>
					<Typography gutterBottom variant="h4">
						Team members (maximum 4)
					</Typography>
					<FieldArray name="members">
						{({push, remove}: FieldArrayRenderProps) => {
							return (
								<div>
									<Grid
										container
										spacing={4}
										sx={(theme) => ({marginBottom: theme.spacing(2)})}
									>
										{values.members.map((member, index) => (
											<TeamMemberForm
												key={index} // eslint-disable-line react/no-array-index-key
												index={index}
												remove={
													values.members.length > 1
														? () => remove(index)
														: undefined
												}
											/>
										))}
									</Grid>

									{values.members.length < 4 && (
										<Button
											startIcon={<AddCircleRoundedIcon />}
											variant="contained"
											sx={(theme) => ({marginBottom: theme.spacing(2)})}
											onClick={() => {
												push(emptyMember);
											}}
										>
											Add a member
										</Button>
									)}
								</div>
							);
						}}
					</FieldArray>

					{Boolean(status) && (
						<Typography gutterBottom color="error">
							{status}
						</Typography>
					)}

					<Typography gutterBottom variant="h4">
						Credentials
					</Typography>
					<Typography paragraph>
						This password is <b>common to your team</b>. In order to access your
						team account later on, you will need to sign in using an email
						address used by one member of your team and this password.
					</Typography>
					<Box sx={(theme) => ({width: '50%', marginBottom: theme.spacing(2)})}>
						<TextField
							fullWidth
							name="password"
							label="Password *"
							type="password"
						/>
						<Typography variant="body2" color="textSecondary">
							Your password should be at least 8 characters long.
						</Typography>
					</Box>
					<Divider variant="middle" />

					<Typography sx={(theme) => ({marginTop: theme.spacing(2)})}>
						If every team member is a first year student at CentraleSupélec,
						Centrale Marseille or Centrale Lille, then you will take part in the
						competition in the first year students&apos; leaderboard.
					</Typography>
					<Grid container direction="column">
						<CheckboxField
							name="acceptRules"
							label={
								<>
									As a team, you have read and you accept the{' '}
									<Link href="https://google.fr" target="__blank">
										rules of the competition
									</Link>
									.
								</>
							}
						/>
						<CheckboxField
							name="acceptDataTreatment"
							label={
								<>
									(TO REPLACE) As a team, you accept that{' '}
									<Link href="https://google.fr" target="__blank">
										we are going to sell your data
									</Link>
									.
								</>
							}
						/>
					</Grid>

					<Button
						fullWidth
						type="submit"
						variant="outlined"
						sx={(theme) => ({marginTop: theme.spacing(2)})}
					>
						Register
					</Button>
					<RegistrationSuccessDialog open={showSuccessDialog} />
				</Form>
			)}
		</Formik>
	);
};

export default TeamRegistrationForm;
