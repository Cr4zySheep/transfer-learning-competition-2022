import axios from 'axios';
import {
	LoginData,
	ForgottenPasswordData,
	ResetPasswordData,
} from 'schemas/auth';

/**
 * Team login.
 * @param values - Team credentials.
 */
export const login = async (values: LoginData) => {
	return axios.post<void>('/api/login', values);
};

/**
 * Ask to reset the team password.
 * @param values - Email of one member of the team.
 * @returns
 */
export const forgottenPassword = async (values: ForgottenPasswordData) => {
	return axios.post<void>('/api/forgotten-password', values);
};

/**
 * Reset the team password.
 * @param values - New password and token.
 * @returns
 */
export const resetPassword = async (values: ResetPasswordData) => {
	return axios.post<void>('/api/reset-password', values);
};
