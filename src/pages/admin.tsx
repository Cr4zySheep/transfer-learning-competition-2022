import React, {useState} from 'react';
import type {NextPage} from 'next';
import {Button, Container, Grid, Typography} from '@mui/material';
import {TeamWithMembersAndSubmissions} from 'types';
import TextField from 'components/TextField';
import {Form, Formik} from 'formik';
import {getAll} from 'services/team';
import {generateNewEmailValidationToken} from 'services/admin';

const AdminPage: NextPage = () => {
	const [teams, setTeams] =
		useState<Array<Omit<TeamWithMembersAndSubmissions, 'password'>>>();

	if (!teams)
		return (
			<Container>
				<Typography gutterBottom variant="h1">
					Admin panel
				</Typography>

				<Formik
					initialValues={{password: ''}}
					onSubmit={async ({password}, {setStatus}) => {
						return getAll(password)
							.then(setTeams)
							.catch(() => {
								setStatus('Password incorrect.');
							});
					}}
				>
					{({status}) => (
						<Form>
							<Grid container spacing={2}>
								<Grid item xs={12} md={6}>
									<TextField
										fullWidth
										name="password"
										label="Password"
										variant="standard"
										type="password"
									/>
								</Grid>

								<Grid item xs={12} md={6}>
									<Button fullWidth type="submit" variant="contained">
										Access the admin panel
									</Button>
								</Grid>
							</Grid>
							{Boolean(status) && (
								<Typography color="error" variant="caption">
									{status}
								</Typography>
							)}
						</Form>
					)}
				</Formik>
			</Container>
		);

	const handleGenerateNewToken = async (id: number) => {
		await generateNewEmailValidationToken(id).then((updatedMember) => {
			setTeams((teams) =>
				teams?.map((team) => ({
					...team,
					members: team.members.map((member) =>
						member.id === id ? updatedMember : member,
					),
				})),
			);
		});
	};

	return (
		<Container>
			<Typography variant="h4">Liste des équipes</Typography>

			<ul>
				{teams.map((team) => (
					<li key={team.id}>
						Team #{team.id} {team.firstYearOnly && ' - First year only'}
						<br />
						{team.submissions.length} submissions
						<br />
						Members:
						<ul>
							{team.members.map((member) => (
								<li key={member.id}>
									{member.firstName} {member.lastName.toUpperCase()} (
									{member.email}) {member.isStudent && `- student`}
									<br />
									{member.emailValidated ? (
										'Email validated'
									) : (
										<>
											<Typography>Pending email validation</Typography>
											<Button
												onClick={async () => handleGenerateNewToken(member.id)}
											>
												Generate new token and resend an email
											</Button>
											{member.emailValidationToken && (
												<Typography>
													Validation link: http://{window.location.host}/token/
													{member.emailValidationToken}
												</Typography>
											)}
										</>
									)}
									<br />
									{member.isStudent ? (
										<>
											{member.university} - {member.yearOfStudy}
										</>
									) : (
										<>
											{member.companyName} - {member.companyRole}
										</>
									)}
								</li>
							))}
						</ul>
					</li>
				))}
			</ul>
		</Container>
	);
};

export default AdminPage;
