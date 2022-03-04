import axios, {AxiosRequestConfig} from 'axios';
import {transformJsonToTeamWithMembersAndSubmissions} from 'lib/team';

import {TeamRegistration} from 'schemas/teamRegistration';
import {
	SubmissionJson,
	TeamWithMembers,
	TeamWithMembersAndSubmissionsJson,
} from 'types';

const API_URL = '/api/team';

export async function getAll(password: string) {
	return axios
		.get<TeamWithMembersAndSubmissionsJson[]>(API_URL, {params: {password}})
		.then((response) =>
			response.data.map((team) =>
				transformJsonToTeamWithMembersAndSubmissions(team),
			),
		);
}

export async function register(team: TeamRegistration) {
	return axios
		.post<TeamWithMembers>(API_URL, team)
		.then((response) => response.data);
}

export async function postSubmission(
	submission: File,
	onUploadProgress: AxiosRequestConfig['onUploadProgress'],
) {
	const config: AxiosRequestConfig = {
		headers: {
			'content-type': 'multipart/form-data',
		},
		onUploadProgress,
	};

	const formData = new FormData();
	formData.append('file', submission);

	return axios
		.post<SubmissionJson>(`${API_URL}/submission`, formData, config)
		.then((response) => response.data);
}
