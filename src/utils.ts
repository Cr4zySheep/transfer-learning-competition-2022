import crypto from 'node:crypto';
import process from 'node:process';
import {EvaluationCriteria, TeamMember} from '@prisma/client';
import nodemailer from 'nodemailer';
import {MAIL_SENDER} from 'consts';
import axios from 'axios';
import prisma from './db';

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
		from: MAIL_SENDER, // Sender address
		to: email,
		subject: 'Ceteris Paribus - Verify your email !',
		text,
	});

	console.debug(`Verify mail : Mail ${info.messageId} sent to ${email}`);
}

export async function sendResetPasswordEmail(user: TeamMember, token: string) {
	const text = `Dear ${user.firstName},

Please click the following link to reset your team's password: http://${
		process.env.HOSTNAME ?? ''
	}/reset-password/${token}

Best regards,
The organizing team`;

	const transporter = getMailTransport();
	const info = await transporter.sendMail({
		from: MAIL_SENDER,
		to: user.email,
		subject: "Ceteris Paribus - Reset your team's password",
		text,
	});

	console.debug(
		`Reset your password : Mail ${info.messageId} sent to ${user.email}`,
	);
}

export async function sendPasswordHasBeenChangedMail(members: TeamMember[]) {
	const text = `The password of your team has been changed successfully.`;

	const emails = members.map((member) => member.email);

	const transporter = getMailTransport();
	const info = await transporter.sendMail({
		from: MAIL_SENDER,
		to: emails,
		subject: 'Ceteris Paribus - Password changed',
		text,
	});

	console.debug(
		`Password changed : Mail ${info.messageId} sent to ${emails.join(', ')}`,
	);
}

export async function sendResetPasswordConsentMail(
	members: TeamMember[],
	author: TeamMember,
	token: string,
) {
	const text = `${author.firstName} ${
		author.lastName
	} just made a demand to reset the password of your team.

By clicking the following link, you authorize ${author.firstName} ${
		author.lastName
	} to change the password of your team: http://${
		process.env.HOSTNAME ?? ''
	}/accept-password-reset/${token}.
Otherwise, just ignore this email.

Best regards,
The organizing team`;

	const emails = members.map((member) => member.email);

	const transporter = getMailTransport();
	const info = await transporter.sendMail({
		from: MAIL_SENDER,
		to: emails,
		subject: `Ceteris Paribus - Authorize ${author.firstName} ${author.lastName} to reset the password of your team`,
		text,
	});

	console.debug(
		`Reset password consent : Mail ${info.messageId} sent to ${emails.join(
			', ',
		)}`,
	);
}

export async function sendResetPasswordInstructions(author: TeamMember) {
	const text = `Dear ${author.firstName},

Because the password is shared between the whole team. We require that at least one other member of your team accepts that you are going to change the password. Hence, the rest of your team should receive an email asking for this permission.

Once it is done, you will receive an email with a link to change the password.

Best regards,
The organizing team`;

	const transporter = getMailTransport();
	const info = await transporter.sendMail({
		from: MAIL_SENDER,
		to: author.email,
		subject:
			'Ceteris Paribus - Next step for changing the password of your team',
		text,
	});

	console.debug(
		`Reset password instructions : Mail ${info.messageId} sent to ${author.email}`,
	);
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

export async function generateResetPasswordToken(): Promise<string> {
	let token: string;
	let isTaken: boolean;
	do {
		token = crypto.randomBytes(32).toString('hex');
		/* eslint-disable no-await-in-loop */
		isTaken = await prisma.team
			.findMany({
				where: {resetPasswordToken: token},
				select: {id: true},
				take: 1,
			})
			.then((data) => data.length > 0);
		/* eslint-enable no-await-in-loop */
	} while (isTaken);

	return token;
}

export async function generateResetPasswordConsentToken(): Promise<string> {
	let token: string;
	let isTaken: boolean;
	do {
		token = crypto.randomBytes(32).toString('hex');
		/* eslint-disable no-await-in-loop */
		isTaken = await prisma.team
			.findMany({
				where: {resetPasswordConsentToken: token},
				select: {id: true},
				take: 1,
			})
			.then((data) => data.length > 0);
		/* eslint-enable no-await-in-loop */
	} while (isTaken);

	return token;
}

export async function generateResetPasswordTokenJury(): Promise<string> {
	let token: string;
	let isTaken: boolean;
	do {
		token = crypto.randomBytes(32).toString('hex');
		/* eslint-disable no-await-in-loop */
		isTaken = await prisma.jury
			.findMany({
				where: {resetPasswordToken: token},
				select: {id: true},
				take: 1,
			})
			.then((data) => data.length > 0);
		/* eslint-enable no-await-in-loop */
	} while (isTaken);

	return token;
}

export function evaluationCriteriaToLabel(criteria: EvaluationCriteria) {
	if (criteria === EvaluationCriteria.CRITERIA_0) return 'realistic';
	if (criteria === EvaluationCriteria.CRITERIA_1) return 'targeted';
	return '';
}

export function labelToEvaluationCriteria(label: string) {
	if (label === 'realistic') return EvaluationCriteria.CRITERIA_0;
	if (label === 'targeted') return EvaluationCriteria.CRITERIA_1;

	console.log('Unknown label:', label);
	return EvaluationCriteria.CRITERIA_0;
}

export async function getControlPairs() {
	const controlPairsData = await prisma.controlPair.findMany({});
	const controlPairs = controlPairsData.map((controlPair) => ({
		id: controlPair.id,
		name: controlPair.name,
		idTeamA: controlPair.idTeamA,
		idTeamB: controlPair.idTeamB,
		evaluationCriteria: evaluationCriteriaToLabel(
			controlPair.evaluationCriteria,
		),
		criteria0:
			controlPair.evaluationCriteria === EvaluationCriteria.CRITERIA_0
				? controlPair.criteria
				: null,
		criteria1:
			controlPair.evaluationCriteria === EvaluationCriteria.CRITERIA_1
				? controlPair.criteria
				: null,
	}));

	return controlPairs;
}

export async function getEvaluationDataForTeams() {
	const evaluationData = await prisma.evaluation.findMany({
		where: {
			assignedTeamId: {not: null},
			assignedJuryId: null,
		},
	});
	const evaluations = evaluationData.map((evaluation) => ({
		...evaluation,
		evaluationCriteria: evaluationCriteriaToLabel(
			evaluation.evaluationCriteria,
		),
	}));

	return evaluations;
}

export async function getEvaluationDataForJury() {
	const evaluationData = await prisma.evaluation.findMany({
		where: {
			assignedTeamId: null,
			assignedJuryId: {not: null},
		},
	});
	const evaluations = evaluationData.map((evaluation) => ({
		...evaluation,
		assignedJuryId: (evaluation.assignedJuryId ?? 1) - 1,
		evaluationCriteria: evaluationCriteriaToLabel(
			evaluation.evaluationCriteria,
		),
	}));

	return evaluations;
}

interface EvaluationData {
	name: string;
	idTeamA: number;
	idTeamB: number;
	assignedTeamId: number;
	assignedTeamMemberId: number;
	evaluationCriteria: 'realistic' | 'targeted';
}

interface EvaluationJuryData {
	name: string;
	idTeamA: number;
	idTeamB: number;
	assignedJuryId: number;
	evaluationCriteria: 'realistic' | 'targeted';
}

export async function replenishBufferForTeam(team: {
	id: number;
	memberId: number;
}) {
	const [controlPairs, evaluationData] = await Promise.all([
		getControlPairs(),
		getEvaluationDataForTeams(),
	]);

	const evaluationsData = await axios
		.post<{evaluations: EvaluationData[]}>(
			`${process.env.PYTHON_SERVER ?? ''}/evaluations`,
			{
				teamId: team.id,
				teamMemberId: team.memberId,
				controlPairs,
				evaluationData,
			},
		)
		.then((response) => response.data.evaluations);

	const data = {
		data: evaluationsData.map((evaluationData) => ({
			name: evaluationData.name,
			idTeamA: evaluationData.idTeamA,
			idTeamB: evaluationData.idTeamB,
			assignedTeamId: evaluationData.assignedTeamId,
			assignedTeamMemberId: evaluationData.assignedTeamMemberId,
			evaluationCriteria: labelToEvaluationCriteria(
				evaluationData.evaluationCriteria,
			),
			version: 0,
		})),
	};

	await prisma.evaluation.createMany(data);
}

export async function replenishBufferForJury(juryId: number) {
	const [controlPairs, evaluationData] = await Promise.all([
		getControlPairs(),
		getEvaluationDataForJury(),
	]);

	const evaluationsData = await axios
		.post<{evaluations: EvaluationJuryData[]}>(
			`${process.env.PYTHON_SERVER ?? ''}/evaluations`,
			{
				juryId: juryId - 1,
				controlPairs,
				evaluationData,
			},
		)
		.then((response) => response.data.evaluations);

	const data = {
		data: evaluationsData.map((evaluationData) => ({
			name: evaluationData.name,
			idTeamA: evaluationData.idTeamA,
			assignedJuryId: evaluationData.assignedJuryId + 1,
			idTeamB: evaluationData.idTeamB,
			evaluationCriteria: labelToEvaluationCriteria(
				evaluationData.evaluationCriteria,
			),
			version: 0,
		})),
	};

	await prisma.evaluation.createMany(data);
}
