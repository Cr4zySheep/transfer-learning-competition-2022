import {Submission, Team, TeamMember} from '@prisma/client';

export interface TeamWithMembers extends Team {
	members: TeamMember[];
}

export interface TeamWithMembersAndSubmissions extends Team {
	members: TeamMember[];
	submissions: Submission[];
}

export interface TeamMemberJson
	extends Omit<TeamMember, 'createdAt' | 'updatedAt' | 'emailValidated'> {
	createdAt: string;
	updatedAt: string;
	emailValidated: string | null;
}

export interface TeamWithMembersJson
	extends Omit<Team, 'createdAt' | 'updatedAt' | 'password'> {
	members: TeamMemberJson[];
	createdAt: string;
	updatedAt: string;
}

export interface TeamWithMembersAndSubmissionsJson
	extends Omit<Team, 'createdAt' | 'updatedAt' | 'password'> {
	members: TeamMemberJson[];
	submissions: SubmissionJson[];
	createdAt: string;
	updatedAt: string;
}

export interface SubmissionJson extends Omit<Submission, 'submittedAt'> {
	submittedAt: string;
}
