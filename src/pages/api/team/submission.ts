import {randomFillSync} from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {Buffer} from 'node:buffer';
import process from 'node:process';
import {NB_MAX_SUBMISSIONS} from 'consts';
import busboy from 'busboy';
import {NextApiRequest, NextApiResponse} from 'next';
import {sessionOptions} from 'lib/session';
import {withIronSessionApiRoute} from 'iron-session/next';
import prisma from 'db';

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

	console.log(timestamp(), '- Creating team folder:', teamFolder);
	await fs.promises.mkdir(teamFolder, {recursive: true});

	let hasFile = false;

	return new Promise<void>((resolve) => {
		const bb = busboy({
			headers: request.headers,
			highWaterMark: 2 * 1024 * 1024, // Set 2MiB buffer
		});

		console.log(timestamp(), filename, '- Start saving');
		bb.on('file', async (name, file, info) => {
			hasFile = true;
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

			const fstream = fs.createWriteStream(filename);
			file.pipe(fstream);

			fstream.on('close', async () => {
				console.log(timestamp(), filename, '- Saved successfully!');
				const submission = await prisma.submission.create({
					data: {
						submittedAt: now,
						fileName: filename,
						teamId,
					},
				});
				response.json(submission);

				// Limit the number of submissions
				const submissionsToDelete = await prisma.submission.findMany({
					where: {teamId},
					orderBy: {submittedAt: 'desc'},
					skip: NB_MAX_SUBMISSIONS,
				});

				await Promise.allSettled(
					submissionsToDelete.map(async (sub) => {
						await fs.promises.unlink(sub.fileName);
						console.log(timestamp(), 'Removed file', sub.fileName);
					}),
				);

				const ids = submissionsToDelete.map((sub) => sub.id);
				await prisma.submission.deleteMany({
					where: {id: {in: ids}},
				});
				console.log(timestamp(), 'Deleted the following submissions', ids);
				resolve();
			});
		});

		bb.on('close', () => {
			if (!hasFile) {
				response.status(400).send('');
				resolve();
			}
		});

		request.pipe(bb);
	});
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
