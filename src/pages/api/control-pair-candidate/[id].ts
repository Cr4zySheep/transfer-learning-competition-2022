import {withIronSessionApiRoute} from 'iron-session/next';
import {sessionOptions} from 'lib/session';
import {NextApiRequest, NextApiResponse} from 'next';
import {prisma} from 'db';

const nameToChoiceField: Record<string, 'nicolasChoice' | 'julesChoice'> = {
	nicolas: 'nicolasChoice',
	jules: 'julesChoice',
};
const nameToGoodCandidateField: Record<
	string,
	'nicolasGoodCandidate' | 'julesGoodCandidate'
> = {
	nicolas: 'nicolasGoodCandidate',
	jules: 'julesGoodCandidate',
};

async function handler(request: NextApiRequest, response: NextApiResponse) {
	const admin = request.session.admin;

	if (admin) {
		// Get the control pair candidate
		const controlPairCandidate = await prisma.controlPairCandidate.findUnique({
			where: {id: Number(request.query.id as string)},
		});
		if (!controlPairCandidate) {
			response.status(404).send('Not found');
			return;
		}

		switch (request.method) {
			case 'POST': {
				const name = request.body.name as string;
				const choice = Boolean(request.body.choice);
				const goodCandidate = Boolean(request.body.goodCandidate);

				await prisma.controlPairCandidate.update({
					where: {id: controlPairCandidate.id},
					data: {
						[nameToChoiceField[name]]: choice,
						[nameToGoodCandidateField[name]]: goodCandidate,
					},
				});

				controlPairCandidate[nameToChoiceField[name]] = choice;
				controlPairCandidate[nameToGoodCandidateField[name]] = goodCandidate;

				if (
					controlPairCandidate.nicolasGoodCandidate &&
					controlPairCandidate.julesGoodCandidate &&
					controlPairCandidate.nicolasChoice ===
						controlPairCandidate.julesChoice
				) {
					await prisma.controlPair.create({
						data: {
							name: controlPairCandidate.name,
							idTeamA: controlPairCandidate.idTeamA,
							idTeamB: controlPairCandidate.idTeamB,
							evaluationCriteria: controlPairCandidate.evaluationCriteria,
							criteria: choice,
						},
					});
				}

				const nb = await prisma.controlPair.count();
				response.send(nb);

				break;
			}

			default:
				response.setHeader('Allow', ['POST', 'GET']);
				response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
		}
	} else {
		response.status(401).send('You should be logged in.');
	}
}

export default withIronSessionApiRoute(handler, sessionOptions);
