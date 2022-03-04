import {randomFillSync} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {Buffer} from 'node:buffer';
import process from 'node:process';
import busboy from 'busboy';
import {NextApiRequest, NextApiResponse} from 'next';
import {sessionOptions} from 'lib/session';
import {withIronSessionApiRoute} from 'iron-session/next';
import {PrismaClient} from '@prisma/client';

export const config = {
	api: {
		bodyParser: false,
	},
};

function timestamp() {
	const now = new Date();
	return now.toISOString();
}

const random = (() => {
	const buf = Buffer.alloc(16);
	return () => randomFillSync(buf).toString('hex');
})();

async function postSubmission(
	teamId: number,
	request: NextApiRequest,
	response: NextApiResponse,
) {
	const id = random();
	const now = new Date();
	const teamFolder = path.join(
		process.env.SUBMISSION_PATH ?? '/data',
		`team-${teamId}`,
	);
	const filename = path.join(teamFolder, `${now.toISOString()}_${id}`);

	try {
		fs.mkdirSync(teamFolder);
	} catch {}

	const bb = busboy({headers: request.headers});
	bb.on('file', (name, file, info) => {
		console.log(
			timestamp(),
			filename,
			'Encoding:',
			info.encoding,
			'Filename:',
			info.filename,
			'Mime type:',
			info.mimeType,
		);
		console.log(timestamp(), filename, '- Start saving');
		const fstream = fs.createWriteStream(filename);
		file.pipe(fstream);

		fstream.on('close', async () => {
			console.log(timestamp(), filename, '- Saved successfully!');
			const prisma = new PrismaClient();
			const submission = await prisma.submission.create({
				data: {
					submittedAt: now,
					fileName: filename,
					teamId,
				},
			});
			response.json(submission);
		});
	});

	// Bb.on('close', () => {});

	request.pipe(bb);
}

async function handler(request: NextApiRequest, response: NextApiResponse) {
	const team = request.session.team;

	// TODO: Check that team exists
	if (!team) {
		response.status(401).send('You should be logged in.');
	}

	switch (request.method) {
		case 'POST':
			await postSubmission(team!.id, request, response);
			break;

		default:
			response.setHeader('Allow', ['POST']);
			response.status(405).end(`Method ${request.method ?? ''} Not Allowed`);
	}
}

export default withIronSessionApiRoute(handler, sessionOptions);
