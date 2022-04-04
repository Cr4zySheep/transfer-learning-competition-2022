import {EvaluationStatus} from '@prisma/client';
import prisma from 'db';

export async function getNbEvaluationsDone(juryId: number) {
	const nbEvaluationsDone = await prisma.evaluation.count({
		where: {
			assignedJuryId: juryId,
			status: EvaluationStatus.DONE,
		},
	});

	return nbEvaluationsDone;
}
