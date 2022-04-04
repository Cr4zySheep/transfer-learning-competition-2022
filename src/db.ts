import process from 'node:process';
import {PrismaClient} from '@prisma/client';

let _prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
	_prisma = new PrismaClient();
} else {
	// @ts-expect-error Hello world
	if (!global.prisma) {
		// @ts-expect-error Hello world
		global.prisma = new PrismaClient();
	}

	// @ts-expect-error Hello world
	_prisma = global.prisma as PrismaClient;
}

const prisma = _prisma;
export default prisma;
