import {zonedTimeToUtc} from 'date-fns-tz';

export const NB_MAX_SUBMISSIONS = 3;
// TODO Fix email, use varenv
export const MAIL_SENDER =
	'Leaf Nothing Behind Competition <ceterisparibus-competition@transfer-learning.org>';

// TODO use varenv
export const REGISTRATION_DEADLINE = zonedTimeToUtc(
	'2024-01-01T02:02Z',
	'Europe/Paris',
);
export const PARTICIPANT_SUBMISSION_DEADLINE = zonedTimeToUtc(
	'2024-04-06T23:59',
	'Europe/Paris',
);
export const COMPETITION_START = zonedTimeToUtc(
	'2023-03-30T21:30',
	'Europe/Paris',
);

// TODO Add & manage competition end
