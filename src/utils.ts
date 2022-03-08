import crypto from 'node:crypto';
import process from 'node:process';
import {PrismaClient} from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

export function getMailTransport() {
	return nodemailer.createTransport({
		host: 'ssl0.ovh.net',
		port: 587,
		secure: false,
		auth: {
			user: process.env.EMAIL_ADDRESS,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
}

export async function sendValidationEmail(
	firstName: string,
	email: string,
	token: string,
): Promise<void> {
	const transporter = getMailTransport();

	const text = `Dear ${firstName},

Thank you for registering as a member of a team in Transfer Learning's Ceteris Paribus Face Challenge.

A few IMPORTANT THINGS for you to know :

	- We need to be sure that you will receive the necessary information during the course of the competition. Please click this link to verify your email address : http://${
		process.env.HOSTNAME ?? ''
	}/token/${token}

	- You can log in to your team account from this page using your email and your team password : https://competition.transfer-learning.org/login

Good luck competing ! You have until April 5th to send us your submissions !

Best regards,
The organizing team`;

	const info = await transporter.sendMail({
		from: 'Ceteris Paribus Competition <ceterisparibus-competition@transfer-learning.org>', // Sender address
		to: email,
		subject: 'Ceteris Paribus - Verify your email !',
		text,
	});

	console.debug(`Mail ${info.messageId} sent to ${email}`);
}

export async function generateEmailValidationToken(): Promise<string> {
	let token: string;
	let isTaken: boolean;
	do {
		token = crypto.randomBytes(32).toString('hex');
		/* eslint-disable no-await-in-loop */
		isTaken = await prisma.teamMember
			.findMany({
				where: {emailValidationToken: token},
				select: {id: true},
				take: 1,
			})
			.then((data) => data.length > 0);
		/* eslint-enable no-await-in-loop */
	} while (isTaken);

	return token;
}
