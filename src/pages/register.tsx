import React from 'react';
import type {NextPage} from 'next';
import {withIronSessionSsr} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {Box, Container, Divider, Typography} from '@mui/material';

import TeamRegistrationForm from 'components/templates/inscription/TeamRegistrationForm';
import Image from 'next/image';

import competitionBanner from 'assets/competition_banner.png';
import {REGISTRATION_DEADLINE} from 'consts';

interface TeamRegistrationPageProps {
	canRegister: boolean;
}

const TeamRegistrationPage: NextPage<TeamRegistrationPageProps> = ({
	canRegister,
}) => {
	return (
		<Container sx={(theme) => ({paddingBottom: theme.spacing(5)})}>
			<Box sx={(theme) => ({padding: theme.spacing(4, 0)})}>
				<Image src={competitionBanner} alt="Competition banner" />
			</Box>

			<Divider
				variant="middle"
				sx={(theme) => ({marginBottom: theme.spacing(5)})}
			/>

			{canRegister ? (
				<TeamRegistrationForm />
			) : (
				<Typography component="p" variant="h6">
					Registrations are closed since{' '}
					{REGISTRATION_DEADLINE.toLocaleString()}.
				</Typography>
			)}
		</Container>
	);
};

export const getServerSideProps = withIronSessionSsr(async () => {
	const now = new Date();

	return {
		props: {
			canRegister: now < REGISTRATION_DEADLINE,
		},
	};
}, sessionOptions);

export default TeamRegistrationPage;
