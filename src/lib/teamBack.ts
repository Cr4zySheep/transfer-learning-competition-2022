import {EvaluationStatus} from '@prisma/client';
import {NB_EVALUATIONS_PER_MEMBER} from 'consts';
import prisma from 'db';

export async function getNbRemainingEvaluations(teamId: number) {
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
