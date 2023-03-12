import {format} from 'date-fns';

export function toParisDateTime(date: Date) {
	return `${format(date, 'MMMM do, HH:mm')} (Paris time)`;
}
