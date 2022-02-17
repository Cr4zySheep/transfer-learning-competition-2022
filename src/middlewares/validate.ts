import {NextApiHandler, NextApiRequest, NextApiResponse} from 'next';
import {ValidationError} from 'yup';
import {ObjectShape, OptionalObjectSchema} from 'yup/lib/object';

/**
 * Validate the request body against the given yup schema for POST and PUT methods.
 *
 * If the validation failed, a 400 Bad Request response is sent with the ValidationError as content.
 * Otherwise, `req.body` is replaced with the validated data and `handler` is called as usual
 */
export default function validate(
	schema: OptionalObjectSchema<ObjectShape>,
	handler: NextApiHandler,
): NextApiHandler {
	return async (request: NextApiRequest, response: NextApiResponse) => {
		if (request.method && ['POST', 'PUT'].includes(request.method)) {
			try {
				request.body = await schema
					.camelCase()
					.validate(request.body, {abortEarly: false, stripUnknown: true});
			} catch (error: unknown) {
				if (error instanceof ValidationError) {
					response.status(400).json(error);
					return;
				}

				throw error;
			}
		}

		await handler(request, response);
	};
}
