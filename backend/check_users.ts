import prisma from './utils/db';

async function checkUsers() {
    try {
        const users = await prisma.user.findMany();
        console.log('Users in DB:', users);
        process.exit(0);
    } catch (error) {
        console.error('Error checking users:', error);
        process.exit(1);
    }
}

checkUsers();
