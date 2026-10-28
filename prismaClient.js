require('dotenv').config();

const { PrismaClient } = require('@prisma/client');

function getDatabaseUrl() {
    if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

    const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME } = process.env;
    if (!DB_HOST || !DB_USER || !DB_NAME) {
        throw new Error('Configure DATABASE_URL ou DB_HOST, DB_USER e DB_NAME no arquivo .env.');
    }

    const user = encodeURIComponent(DB_USER);
    const password = encodeURIComponent(DB_PASSWORD || '');
    const host = DB_HOST.includes(':') && !DB_HOST.startsWith('[') ? `[${DB_HOST}]` : DB_HOST;
    const port = process.env.DB_PORT || '3306';
    return `mysql://${user}:${password}@${host}:${port}/${encodeURIComponent(DB_NAME)}`;
}

const prisma = new PrismaClient({
    datasources: {
        db: { url: getDatabaseUrl() }
    }
});

module.exports = prisma;