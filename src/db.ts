import process from 'node:process';
import {PrismaClient} from '@prisma/client';

// @ts-expect-error Only for development
export const prisma = (global.prisma ?? new PrismaClient()) as PrismaClient;

// @ts-expect-error Only for development
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
