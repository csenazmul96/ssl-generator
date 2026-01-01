require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- Users ---');
    const users = await prisma.user.findMany();
    console.log(users);

    console.log('\n--- Domains ---');
    const domains = await prisma.domain.findMany();
    console.log(domains);
}

main()
    .catch((e) => {
        throw e;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
