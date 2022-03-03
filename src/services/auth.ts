import axios from 'axios';
import {LoginData} from 'schemas/auth';

/**
 * Team login.
 * @param values - Team credentials.
 */
export const login = async (values: LoginData) => {
	return axios.post<void>('/api/login', values);
};
