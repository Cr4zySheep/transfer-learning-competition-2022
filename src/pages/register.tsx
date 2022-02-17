import React from 'react';
import type {NextPage} from 'next';
import {Box, Container, Divider, Typography} from '@mui/material';

import TeamRegistrationForm from 'components/templates/inscription/TeamRegistrationForm';
import Image from 'next/image';

import competitionBanner from 'assets/competition_banner.png';

const TeamRegistrationPage: NextPage = () => {
	return (
		<Container sx={(theme) => ({paddingBottom: theme.spacing(5)})}>
			<Box sx={(theme) => ({padding: theme.spacing(4, 0)})}>
				<Image src={competitionBanner} alt="Competition banner" />
			</Box>

			<Divider
				variant="middle"
				sx={(theme) => ({marginBottom: theme.spacing(5)})}
			/>

			<Typography variant="h1">Registration</Typography>

			<TeamRegistrationForm />
		</Container>
	);
};

export default TeamRegistrationPage;
