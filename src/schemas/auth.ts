import {InferType, object, string} from 'yup';

const MANDATORY_FIELD = 'This field is necessary.';

export const loginSchema = object({
	email: string().required(MANDATORY_FIELD).trim(),
	password: string().required(MANDATORY_FIELD).trim(),
});
export interface LoginData extends InferType<typeof loginSchema> {}

export const forgottenPasswordSchema = object({
	email: string().required(MANDATORY_FIELD).trim(),
});
export interface ForgottenPasswordData
	extends InferType<typeof forgottenPasswordSchema> {}

export const resetPasswordSchema = object({
	password: string().required(MANDATORY_FIELD).trim().min(8),
	token: string().required(),
});
export interface ResetPasswordData
	extends InferType<typeof resetPasswordSchema> {}
