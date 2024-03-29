import {array, InferType, object, string, StringSchema, bool} from 'yup';

export const universities = new Set([
	'CentraleSupélec',
	'Centrale Marseille',
	'Centrale Lille',
]);

const MANDATORY_FIELD = 'This field is necessary.';

export const teamMemberRegistration = object({
	firstName: string().required(MANDATORY_FIELD).trim(),
	lastName: string().required(MANDATORY_FIELD).trim(),
	email: string()
		.required(MANDATORY_FIELD)
		.email('It should be a valid email address.')
		.trim(),
	isStudent: string()
		.required('Please select one of the options above.')
		.oneOf(['YES', 'NO']),
	university: string()
		.trim()
		.when('isStudent', {
			is: 'YES',
			then: (schema) => schema.required('Please indicate your university.'),
			otherwise: (schema) => schema.optional(),
		}),
	yearOfStudy: string()
		.trim()
		.when('university', (university, schema: StringSchema) =>
			universities.has(university)
				? schema.required(MANDATORY_FIELD)
				: schema.optional(),
		),
	companyName: string().optional().trim(),
	companyRole: string().optional().trim(),
});
export interface TeamMemberRegistrationData
	extends InferType<typeof teamMemberRegistration> {}

const teamRegistration = object({
	members: array(teamMemberRegistration).min(1).max(4),
	password: string().required(MANDATORY_FIELD).min(8),
	acceptRules: bool().required().oneOf([true], 'Read the text please.'),
	acceptDataTreatment: bool().oneOf(
		[true],
		"You need to accept, otherwise you can't take part in the competition.",
	),
});

export default teamRegistration;
export interface TeamRegistration extends InferType<typeof teamRegistration> {}
export interface TeamMemberRegistration
	extends InferType<typeof teamMemberRegistration> {}
