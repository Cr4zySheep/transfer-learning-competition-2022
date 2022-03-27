import {Evaluation} from '@prisma/client';
import axios from 'axios';

export async function fetchNextAssignedEvaluations(ignoreId?: number) {
	return axios
		.get<Evaluation>('/api/evaluation', {params: {ignoreId}})
		.then((response) => response.data);
}

export async function chooseEvaluation(id: number, choice: boolean) {
	return axios
		.post<number>(`/api/evaluation/${id}`, {choice})
		.then((response) => response.data);
}
