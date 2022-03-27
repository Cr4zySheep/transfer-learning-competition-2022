const {parse} = require('url');
const {createServer} = require('http');
const path = require('path');
const fs = require('fs');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 3000;
// When using middleware `hostname` and `port` must be provided below
const app = next({dev, hostname, port});
const handle = app.getRequestHandler();

app.prepare().then(() => {
	createServer(async (request, response) => {
		try {
			// Be sure to pass `true` as the second argument to `url.parse`.
			// This tells it to parse the query portion of the URL.
			const parsedUrl = parse(request.url, true);
			const {pathname, query} = parsedUrl;

			if (pathname.startsWith('/media/')) {
				const target = pathname.replace('/media/', '');
				const filePath = path.join(process.env.SUBMISSION_PATH, target);
				const stat = fs.statSync(filePath);

				response.writeHead(200, {
					'Content-Length': stat.size,
				});

				const readStream = fs.createReadStream(filePath);
				// We replaced all the event handlers with a simple call to readStream.pipe()
				readStream.pipe(response);
				return;
			}

			await (pathname === '/b'
				? app.render(request, response, '/b', query)
				: handle(request, response, parsedUrl));
		} catch (error) {
			console.error('Error occurred handling', request.url, error);
			response.statusCode = 500;
			response.end('internal server error');
		}
	}).listen(port, (error) => {
		if (error) throw error;
		console.log(`> Ready on http://${hostname}:${port}`);
	});
});
