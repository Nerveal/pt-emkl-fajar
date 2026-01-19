import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Prisma 7 client with PostgreSQL adapter - lazy initialization for build safety
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

let _prisma: PrismaClient | undefined;

function createPrismaClient(): PrismaClient {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);

    return new PrismaClient({ adapter });
}

// Lazy getter that only creates client when actually used
export const prisma = new Proxy({} as PrismaClient, {
    get(_target, prop) {
        if (!_prisma) {
            if (globalForPrisma.prisma) {
                _prisma = globalForPrisma.prisma;
            } else {
                _prisma = createPrismaClient();
                if (process.env.NODE_ENV !== 'production') {
                    globalForPrisma.prisma = _prisma;
                }
            }
        }
        return (_prisma as unknown as Record<string, unknown>)[prop as string];
    }
});
