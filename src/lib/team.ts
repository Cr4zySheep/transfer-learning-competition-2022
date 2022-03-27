import {EvaluationStatus, PrismaClient} from '@prisma/client';
import {NB_EVALUATIONS_PER_MEMBER} from 'consts';
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

export async function getNbRemainingEvaluations(teamId: number) {
	const prisma = new PrismaClient();
	const team = await prisma.team.findUnique({
		where: {id: teamId},
		select: {id: true, members: true},
		rejectOnNotFound: true,
	});

	const nbEvaluationsDone = await prisma.evaluation.count({
		where: {
			assignedTeamId: team.id,
			status: EvaluationStatus.DONE,
		},
	});

	return NB_EVALUATIONS_PER_MEMBER * team.members.length - nbEvaluationsDone;
}
