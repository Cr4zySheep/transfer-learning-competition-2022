import React, {useState} from 'react';
import type {NextPage} from 'next';
import {
	Button,
	ButtonProps,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	Grid,
	Typography,
} from '@mui/material';
import {
	TeamWithMembersAndSubmissions,
	TeamWithMembersAndSubmissionsJson,
} from 'types';
import {
	addNewTeamMember,
	deleteTeam,
	generateNewEmailValidationToken,
	updateTeamMember,
} from 'services/admin';
import {withIronSessionSsr} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {TeamMember} from '@prisma/client';
import {
	parseTeamWithMembersAndSubmissionToJson,
	transformJsonToTeamWithMembersAndSubmissions,
} from 'lib/team';
import {Form, Formik} from 'formik';
import TeamMemberForm from 'components/templates/inscription/TeamMemberForm';
import {teamMemberRegistration} from 'schemas/teamRegistration';
import * as yup from 'yup';
import prisma from 'db';

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

interface AdminPageProps {
	teams: TeamWithMembersAndSubmissionsJson[];
}

interface ButtonWithConfirmationProps extends ButtonProps {
	onConfirm: () => void;
	dialogTitle: string;
}

const ButtonWithConfirmation: React.FunctionComponent<
	ButtonWithConfirmationProps
> = ({onConfirm, dialogTitle, ...props}) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<Button
				{...props}
				onClick={() => {
					setOpen(true);
				}}
			/>
			<Dialog
				open={open}
				onClose={() => {
					setOpen(false);
				}}
			>
				<DialogTitle>{dialogTitle}</DialogTitle>
				<DialogActions>
					<Button
						variant="contained"
						onClick={() => {
							setOpen(false);
						}}
					>
						No
					</Button>
					<Button
						variant="contained"
						onClick={() => {
							onConfirm();
							setOpen(false);
						}}
					>
						Yes
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

const AdminPage: NextPage<AdminPageProps> = (props) => {
	const [teams, setTeams] = useState<
		Array<Omit<TeamWithMembersAndSubmissions, 'password'>>
	>(
		props.teams.map((team) =>
			transformJsonToTeamWithMembersAndSubmissions(team),
		),
	);

	const [teamMember, setTeamMember] = useState<TeamMember>();
	const [selectedTeamId, setSelectedTeamId] = useState<number>();

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
			<Typography gutterBottom variant="h4">
				Liste des équipes
			</Typography>

			<Dialog
				fullWidth
				open={Boolean(teamMember)}
				onClose={() => {
					setTeamMember(undefined);
				}}
			>
				<DialogTitle>Edit a team member</DialogTitle>
				<DialogContent>
					<Formik
						enableReinitialize
						initialValues={
							teamMember
								? {
										firstName: teamMember.firstName,
										lastName: teamMember.lastName,
										email: teamMember.email,
										university: teamMember.university ?? '',
										yearOfStudy: teamMember.yearOfStudy ?? '',
										companyName: teamMember.companyName ?? '',
										companyRole: teamMember.companyRole ?? '',
										isStudent: teamMember.isStudent ? 'YES' : 'NO',
								  }
								: emptyMember
						}
						validationSchema={teamMemberRegistration}
						onSubmit={async (values, {setStatus}) => {
							return updateTeamMember(teamMember!.id, values)
								.then((updatedTeam) => {
									setTeams((oldTeams) =>
										oldTeams.map((team) =>
											team.id === updatedTeam.id
												? transformJsonToTeamWithMembersAndSubmissions(
														updatedTeam,
												  )
												: team,
										),
									);
									setTeamMember(undefined);
								})
								.catch((error) => {
									setStatus('An error occured.');
									console.error(error);
								});
						}}
					>
						{({status}) => (
							<Form>
								<TeamMemberForm index={0} prefix="" />

								{Boolean(status) && (
									<Typography gutterBottom color="error">
										{status}
									</Typography>
								)}

								<Grid container alignItems="baseline">
									<Button
										onClick={() => {
											setTeamMember(undefined);
										}}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										variant="outlined"
										sx={(theme) => ({marginTop: theme.spacing(2)})}
									>
										Save
									</Button>
								</Grid>
							</Form>
						)}
					</Formik>
				</DialogContent>
			</Dialog>
			<Dialog
				fullWidth
				open={Boolean(selectedTeamId)}
				onClose={() => {
					setSelectedTeamId(undefined);
				}}
			>
				<DialogTitle>Add a team member</DialogTitle>
				<DialogContent>
					<Formik
						initialValues={{teamId: selectedTeamId ?? 0, ...emptyMember}}
						validationSchema={yup
							.object({teamId: yup.number().required()})
							.concat(teamMemberRegistration)}
						onSubmit={async (values, {setStatus}) => {
							return addNewTeamMember(values)
								.then((updatedTeam) => {
									setTeams((oldTeams) =>
										oldTeams.map((team) =>
											team.id === updatedTeam.id
												? transformJsonToTeamWithMembersAndSubmissions(
														updatedTeam,
												  )
												: team,
										),
									);
									setSelectedTeamId(undefined);
								})
								.catch((error) => {
									setStatus('An error occured.');
									console.error(error);
								});
						}}
					>
						{({status}) => (
							<Form>
								<TeamMemberForm index={0} prefix="" />

								{Boolean(status) && (
									<Typography gutterBottom color="error">
										{status}
									</Typography>
								)}

								<Grid container alignItems="baseline">
									<Button
										onClick={() => {
											setSelectedTeamId(undefined);
										}}
									>
										Cancel
									</Button>
									<Button
										type="submit"
										variant="outlined"
										sx={(theme) => ({marginTop: theme.spacing(2)})}
									>
										Add
									</Button>
								</Grid>
							</Form>
						)}
					</Formik>
				</DialogContent>
			</Dialog>
			<ul>
				{teams.map((team) => (
					<li key={team.id}>
						Team #{team.id} {team.firstYearOnly && ' - First year only'} <br />
						{team.submissions.length} submissions{' '}
						<ul>
							{team.submissions.map(({id, fileName, submittedAt}) => (
								<li key={id}>
									{fileName} - {submittedAt.toLocaleDateString()}
								</li>
							))}
						</ul>
						<br />
						{team.members.length < 4 && (
							<Button
								onClick={() => {
									setSelectedTeamId(team.id);
								}}
							>
								Add a member
							</Button>
						)}
						<ButtonWithConfirmation
							color="error"
							dialogTitle={`Delete team #${team.id}?`}
							onConfirm={() => {
								deleteTeam(team.id)
									.then(() => {
										setTeams((oldTeams) =>
											oldTeams.filter((oldTeam) => team.id !== oldTeam.id),
										);
									})
									.catch((error) => {
										console.log(error);
									});
							}}
						>
							Delete this team
						</ButtonWithConfirmation>
						<br />
						Members:
						<ul>
							{team.members.map((member) => (
								<li key={member.id}>
									{member.firstName} {member.lastName.toUpperCase()} (
									{member.email}) {member.isStudent && `- student`}
									<br />
									<Button
										onClick={() => {
											setTeamMember(member);
										}}
									>
										Edit team member
									</Button>
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
													Validation link:
													https://competition.transfer-learning.org/token/
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

export const getServerSideProps = withIronSessionSsr(async ({req}) => {
	if (!req.session.admin)
		return {
			redirect: {destination: '/admin/login', permanent: false},
		};

	const teams = await prisma.team
		.findMany({
			include: {members: true, submissions: {orderBy: {submittedAt: 'desc'}}},
		})
		.then((data) =>
			data.map((team) => parseTeamWithMembersAndSubmissionToJson(team)),
		);

	return {props: {teams}};
}, sessionOptions);
