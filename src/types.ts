import {Team, TeamMember} from '@prisma/client';

export interface TeamWithMembers extends Team {
	members: TeamMember[];
}
