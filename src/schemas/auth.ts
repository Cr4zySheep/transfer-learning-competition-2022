import {InferType, object, string} from 'yup';

const MANDATORY_FIELD = 'This field is necessary.';

const login = object({
	email: string().required(MANDATORY_FIELD).trim(),
	password: string().required(MANDATORY_FIELD).trim(),
});

export default login;
export interface LoginData extends InferType<typeof login> {}
