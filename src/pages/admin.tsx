import React from 'react';
import type {NextPage} from 'next';
import {Container, Typography} from '@mui/material';
import {TeamWithMembers} from 'types';
import {PrismaClient} from '@prisma/client';

interface AdminPageProps {
	teams: TeamWithMembers[];
}

const AdminPage: NextPage<AdminPageProps> = ({teams}) => {
	return (
		<Container>
			<Typography variant="h4">Liste des équipes</Typography>

			<ul>
				{teams.map((team) => (
					<li key={team.id}>
						Equipe n°{team.id} {team.firstYearOnly && ' - First year only'}
						<br />
						Membres:
						<ul>
							{team.members.map((member) => (
								<li key={member.id}>
									{member.firstName} {member.lastName.toUpperCase()} (
									{member.email}) {member.isStudent && `- étudiant`}
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

export async function getServerSideProps() {
	const prisma = new PrismaClient();

	const teams = await prisma.team
		.findMany({include: {members: true}})
		.then((data) =>
			data.map(({password, ...team}) => ({
				...team,
				createdAt: team.createdAt.toISOString(),
				updatedAt: team.updatedAt.toISOString(),
				members: team.members.map((member) => ({
					...member,
					createdAt: member.createdAt.toISOString(),
					updatedAt: member.updatedAt.toISOString(),
				})),
			})),
		);

	return {
		props: {teams}, // Will be passed to the page component as props
	};
}
