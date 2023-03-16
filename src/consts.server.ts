import process from 'node:process';

// TODO Var for competition name
export const MAIL_SENDER = `Leaf Nothing Behind Competition <${
	process.env.EMAIL_ADDRESS ?? 'nepasrepondre@transfer-learning.org'
}`;
