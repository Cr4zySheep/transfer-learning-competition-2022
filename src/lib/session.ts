// This file is a wrapper with defaults to be used in both API routes and `getServerSideProps` functions
import process from 'node:process';
import type {IronSessionOptions} from 'iron-session';

// TODO: Use env var for password
// TODO: Rename cookie
export const sessionOptions: IronSessionOptions = {
	password:
		'random_passwordrandom_passwordrandom_passwordrandom_passwordrandom_password', // TODO: Use process.env.SECRET_COOKIE_PASSWORD!,
	cookieName: 'iron-session/examples/next.js',
	cookieOptions: {
		secure: process.env.NODE_ENV === 'production',
	},
};

// This is where we specify the typings of req.session.*
declare module 'iron-session' {
	interface IronSessionData {
		team?: {
			id: number;
		};
		admin: boolean;
	}
}
