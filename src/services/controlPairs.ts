import {ControlPairCandidate} from '@prisma/client';
import axios from 'axios';

export async function fetchNextControlPairs(name: string, ignoreId?: number) {
	return axios
		.get<ControlPairCandidate>('/api/control-pair-candidate', {
			params: {name, ignoreId},
		})
		.then((response) => response.data);
}

export async function chooseControlPairCandidate(
	id: number,
	name: string,
	choice: boolean,
	goodCandidate: boolean,
) {
	return axios
		.post<number>(`/api/control-pair-candidate/${id}`, {
			name,
			choice,
			goodCandidate,
		})
		.then((response) => response.data);
}
