import {Team, TeamMember} from '@prisma/client';

export interface TeamWithMembers extends Team {
	members: TeamMember[];
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
