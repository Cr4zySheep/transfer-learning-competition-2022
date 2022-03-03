import axios from 'axios';

import {TeamRegistration} from 'schemas/teamRegistration';
import {TeamWithMembers} from 'types';

const API_URL = '/api/team';

export async function getAll(password: string) {
	return axios
		.get<TeamWithMembers[]>(API_URL, {params: {password}})
		.then((response) => response.data);
}

export async function register(team: TeamRegistration) {
	return axios
		.post<TeamWithMembers>(API_URL, team)
		.then((response) => response.data);
}
