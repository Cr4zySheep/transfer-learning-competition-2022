import {
	TeamWithMembersAndSubmissions,
	TeamWithMembersAndSubmissionsJson,
} from 'types';

/**
 * Remove the password, and transform dates to string.
 */
export function parseTeamWithMembersAndSubmissionToJson({
	password,
	...team
}: TeamWithMembersAndSubmissions): TeamWithMembersAndSubmissionsJson {
	return {
		...team,
		createdAt: team.createdAt.toISOString(),
		updatedAt: team.updatedAt.toISOString(),
		members: team.members.map((member) => ({
			...member,
			createdAt: member.createdAt.toISOString(),
			updatedAt: member.updatedAt.toISOString(),
			emailValidated: member.emailValidated?.toISOString() ?? null,
		})),
		submissions: team.submissions.map((submission) => ({
			...submission,
			submittedAt: submission.submittedAt.toISOString(),
		})),
	};
}

export function transformJsonToTeamWithMembersAndSubmissions(
	team: TeamWithMembersAndSubmissionsJson,
): Omit<TeamWithMembersAndSubmissions, 'password'> {
	return {
		...team,
		createdAt: new Date(team.createdAt),
		updatedAt: new Date(team.updatedAt),
		members: team.members.map((member) => ({
			...member,
			createdAt: new Date(member.createdAt),
			updatedAt: new Date(member.updatedAt),
			emailValidated: member.emailValidated
				? new Date(member.emailValidated)
				: null,
		})),
		submissions: team.submissions.map((submission) => ({
			...submission,
			submittedAt: new Date(submission.submittedAt),
		})),
	};
}
