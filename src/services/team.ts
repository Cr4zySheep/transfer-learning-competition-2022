import axios from 'axios';
// Import {join} from 'node:path';

import {TeamRegistration} from 'schemas/teamRegistration';
import {TeamWithMembers} from 'types';

const API_URL = '/api/team';

export async function getAll() {
	return axios.get<TeamWithMembers>(API_URL).then((response) => response.data);
}

export async function register(team: TeamRegistration) {
	return axios
		.post<TeamWithMembers>(API_URL, team)
		.then((response) => response.data);
}
