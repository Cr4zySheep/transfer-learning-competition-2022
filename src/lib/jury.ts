import {EvaluationStatus, PrismaClient} from '@prisma/client';

export async function getNbEvaluationsDone(juryId: number) {
	const prisma = new PrismaClient();

	const nbEvaluationsDone = await prisma.evaluation.count({
		where: {
			assignedJuryId: juryId,
			status: EvaluationStatus.DONE,
		},
	});

	return nbEvaluationsDone;
}
