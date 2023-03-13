import {TeamMember} from '@prisma/client';
import axios from 'axios';
import {TeamMemberRegistrationData} from 'schemas/teamRegistration';
import {TeamWithMembersAndSubmissionsJson} from 'types';

export async function adminLogin(password: string) {
	return axios.post('/api/admin/login', {password});
}

export async function generateNewEmailValidationToken(
	id: number,
): Promise<TeamMember> {
	return axios
		.post<TeamMember>('/api/admin/token', {id})
		.then((response) => response.data);
}

export async function updateTeamMember(
	id: number,
	values: TeamMemberRegistrationData,
) {
	return axios
		.put<TeamWithMembersAndSubmissionsJson>(
			`/api/admin/team-member/${id}`,
			values,
		)
		.then((response) => response.data);
}

interface NewTeamMember extends TeamMemberRegistrationData {
	teamId: number;
}

export async function addNewTeamMember(values: NewTeamMember) {
	return axios
		.post<TeamWithMembersAndSubmissionsJson>('/api/admin/team-member', values)
		.then((response) => response.data);
}

export async function deleteTeam(id: number) {
	return axios.delete(`/api/admin/team/${id}`);
}
