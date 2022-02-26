import {TeamMember} from '@prisma/client';
import axios from 'axios';

export async function generateNewEmailValidationToken(
	id: number,
): Promise<TeamMember> {
	return axios
		.post<TeamMember>('/api/admin/token', {id})
		.then((response) => response.data);
}
