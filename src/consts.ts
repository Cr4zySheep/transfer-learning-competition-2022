export const NB_MAX_SUBMISSIONS = 3;
export const MAIL_SENDER =
	'Ceteris Paribus Competition <ceterisparibus-competition@transfer-learning.org>';

// Prod dates
export const REGISTRATION_DEADLINE = new Date('2024-01-01T02:02');
export const PARTICIPANT_SUBMISSION_DEADLINE = new Date('2024-04-06T21:59'); // April 6th 2022, 23:59
export const PARTICIPANT_EVALUATION_START = new Date('2022-04-07T08:00'); // April 7th 2022, 8:00
export const PARTICIPANT_EVALUATION_END = new Date('2022-04-07T21:59'); // April 7th 2022, 23:59
export const JURY_START_DATETIME = new Date('2022-04-07T22:01'); // April 8th 2022, 00:01
export const JURY_END_DATETIME = new Date('2023-04-13T21:59'); // April 13th 2022, 23:59

// Dev dates
// export const PARTICIPANT_SUBMISSION_DEADLINE = new Date('2023-04-05T23:59');
// export const PARTICIPANT_EVALUATION_START = new Date('2021-04-06T08:00');
// export const PARTICIPANT_EVALUATION_END = new Date('2022-04-06T23:59');
// export const JURY_START_DATETIME = new Date('2021-04-07T00:01'); // April 7th 2022, 00:01
// export const JURY_END_DATETIME = new Date('2022-04-10T23:59'); // April 10th 2022, 23:59

export const NB_EVALUATIONS_PER_MEMBER = 0;

export const VARIATION_TEXTS: Record<
	string,
	Array<{text: string; bold: boolean}>
> = {
	Sk_0: [
		{
			text: "Variation 'Sk_0' : the reference image's ",
			bold: false,
		},
		{
			text: 'skin tone',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'pale',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Sk_1: [
		{
			text: "Variation 'Sk_1' : the reference image's ",
			bold: false,
		},
		{
			text: 'skin tone',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'intermediate',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Sk_2: [
		{
			text: "Variation 'Sk_2' : the reference image's ",
			bold: false,
		},
		{
			text: 'skin tone',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'dark',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	A_0: [
		{
			text: "Variation 'A_0' : the reference image's ",
			bold: false,
		},
		{
			text: 'age',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'youngest',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	A_1: [
		{
			text: "Variation 'A_1' : the reference image's ",
			bold: false,
		},
		{
			text: 'age',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'intermediate',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	A_2: [
		{
			text: "Variation 'A_2' : the reference image's ",
			bold: false,
		},
		{
			text: 'age',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'oldest',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Se_0: [
		{
			text: "Variation 'Se_0' : the reference image's ",
			bold: false,
		},
		{
			text: 'biological sex',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'male',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Se_1: [
		{
			text: "Variation 'Se_1' : the reference image's ",
			bold: false,
		},
		{
			text: 'biological sex',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'female',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	B_0: [
		{
			text: "Variation 'B_0' : the reference image's ",
			bold: false,
		},
		{
			text: 'bangs',
			bold: true,
		},
		{
			text: ' were made to be ',
			bold: false,
		},
		{
			text: 'absent',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	B_1: [
		{
			text: "Variation 'B_1' : the reference image's ",
			bold: false,
		},
		{
			text: 'bangs',
			bold: true,
		},
		{
			text: ' were made to be ',
			bold: false,
		},
		{
			text: 'present',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Hc_0: [
		{
			text: "Variation 'Hc_0' : the reference image's ",
			bold: false,
		},
		{
			text: 'hair colour',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'black',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Hc_1: [
		{
			text: "Variation 'Hc_1' : the reference image's ",
			bold: false,
		},
		{
			text: 'hair colour',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'blond',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Hc_2: [
		{
			text: "Variation 'Hc_2' : the reference image's ",
			bold: false,
		},
		{
			text: 'hair colour',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'brown',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Hc_3: [
		{
			text: "Variation 'Hc_3' : the reference image's ",
			bold: false,
		},
		{
			text: 'hair colour',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'gray',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	D_0: [
		{
			text: "Variation 'D_0' : the reference image's ",
			bold: false,
		},
		{
			text: 'double-chin',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'absent',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	D_1: [
		{
			text: "Variation 'D_1' : the reference image's ",
			bold: false,
		},
		{
			text: 'double-chin',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'present',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Hs_0: [
		{
			text: "Variation 'Hs_0' : the reference image's ",
			bold: false,
		},
		{
			text: 'hair shape',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'straight',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Hs_1: [
		{
			text: "Variation 'Hs_1' : the reference image's ",
			bold: false,
		},
		{
			text: 'hair shape',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'curly',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	bald: [
		{
			text: "Variation 'bald' : the reference image was made to be ",
			bold: false,
		},
		{
			text: 'bald',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Be_min: [
		{
			text: "Variation 'Be_min' : the reference image's ",
			bold: false,
		},
		{
			text: 'bags under the eyes',
			bold: true,
		},
		{
			text: ' were made to be ',
			bold: false,
		},
		{
			text: 'invisible',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Be_max: [
		{
			text: "Variation 'Be_max' : the reference image's ",
			bold: false,
		},
		{
			text: 'bags under the eyes',
			bold: true,
		},
		{
			text: ' were made to be ',
			bold: false,
		},
		{
			text: 'very marked',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	N_min: [
		{
			text: "Variation 'N_min' : the reference image's ",
			bold: false,
		},
		{
			text: 'eyes',
			bold: true,
		},
		{
			text: ' were made to be ',
			bold: false,
		},
		{
			text: 'very round',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	N_max: [
		{
			text: "Variation 'N_max' : the reference image's ",
			bold: false,
		},
		{
			text: 'eyes',
			bold: true,
		},
		{
			text: ' were made to be ',
			bold: false,
		},
		{
			text: 'very narrow',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Pn_min: [
		{
			text: "Variation 'Pn_min' : the reference image's ",
			bold: false,
		},
		{
			text: 'nose',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'very flat',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Pn_max: [
		{
			text: "Variation 'Pn_max' : the reference image's ",
			bold: false,
		},
		{
			text: 'nose',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'very pointy',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Bp_min: [
		{
			text: "Variation 'Bp_min' : the reference image's ",
			bold: false,
		},
		{
			text: 'lips',
			bold: true,
		},
		{
			text: ' were made to be ',
			bold: false,
		},
		{
			text: 'very thin',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Bp_max: [
		{
			text: "Variation 'Bp_max' : the reference image's ",
			bold: false,
		},
		{
			text: 'lips',
			bold: true,
		},
		{
			text: ' were made to be ',
			bold: false,
		},
		{
			text: 'very big',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Bn_min: [
		{
			text: "Variation 'Bn_min' : the reference image's ",
			bold: false,
		},
		{
			text: 'nose',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'very thin',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Bn_max: [
		{
			text: "Variation 'Bn_max' : the reference image's ",
			bold: false,
		},
		{
			text: 'nose',
			bold: true,
		},
		{
			text: ' was made to be ',
			bold: false,
		},
		{
			text: 'very big',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Ch_min: [
		{
			text: "Variation 'Ch_min' : the reference image's ",
			bold: false,
		},
		{
			text: 'cheeks',
			bold: true,
		},
		{
			text: ' were made to be ',
			bold: false,
		},
		{
			text: 'very skinny',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
	Ch_max: [
		{
			text: "Variation 'Ch_max' : the reference image's ",
			bold: false,
		},
		{
			text: 'cheeks',
			bold: true,
		},
		{
			text: ' were made to be ',
			bold: false,
		},
		{
			text: 'very chubby',
			bold: true,
		},
		{
			text: '.',
			bold: false,
		},
	],
};
