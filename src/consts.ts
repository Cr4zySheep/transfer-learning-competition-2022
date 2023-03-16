import {zonedTimeToUtc} from 'date-fns-tz';

export const NB_MAX_SUBMISSIONS = 3;

export const REGISTRATION_DEADLINE = zonedTimeToUtc(
	'2023-04-07T23:59',
	'Europe/Paris',
);
export const COMPETITION_START = zonedTimeToUtc(
	'2023-03-30T21:30',
	'Europe/Paris',
);
export const PARTICIPANT_SUBMISSION_DEADLINE = zonedTimeToUtc(
	'2023-04-20T23:59',
	'Europe/Paris',
);
