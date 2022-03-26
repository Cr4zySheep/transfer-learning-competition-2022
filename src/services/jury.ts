import axios from 'axios';
import {LoginData, ResetPasswordData} from 'schemas/auth';

/**
 * Jury login.
 * @param values - Team credentials.
 */
export const login = async (values: LoginData) => {
	return axios.post<void>('/api/jury/login', values);
};

/**
 * Reset the jury password.
 * @param values - New password and token.
 * @returns
 */
export const resetPassword = async (values: ResetPasswordData) => {
	return axios.post<void>('/api/jury/reset-password', values);
};
