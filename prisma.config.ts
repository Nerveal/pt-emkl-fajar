import path from 'node:path';
import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

// Explicitly load .env file
dotenv.config();

export default defineConfig({
    schema: path.join(__dirname, 'prisma', 'schema.prisma'),

    url: async () => {
        const url = process.env.DATABASE_URL;
        if (!url) {
            throw new Error('DATABASE_URL is not set in .env file');
        }
        return url;
    },
});
