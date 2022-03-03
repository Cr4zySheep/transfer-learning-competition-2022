import {TeamWithMembers, TeamWithMembersJson} from 'types';

/**
 * Remove the password, and transform dates to string.
 */
export function parseTeamWithMembersToJson({
	password,
	...team
}: TeamWithMembers): TeamWithMembersJson {
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
	};
}

export function transformJsonToTeamWithMembers(
	team: TeamWithMembersJson,
): Omit<TeamWithMembers, 'password'> {
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
	};
}
