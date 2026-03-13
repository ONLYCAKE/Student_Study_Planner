import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Reset database (optional but good for clean seeds)
  await prisma.notification.deleteMany();
  await prisma.task.deleteMany();
  await prisma.studySession.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.user.deleteMany();

  const isHeavy = process.env.HEAVY === 'true';
  const userCount = isHeavy ? 10 : 5;
  const password = await bcrypt.hash('password123', 10);

  // 1. Create a fixed test user first
  const fixedUser = await prisma.user.create({
    data: {
      name: 'Pattani Divy',
      email: 'divy@example.com',
      password: password,
    },
  });
  console.log(`Created fixed test user: ${fixedUser.email}`);
  await seedUserData(fixedUser, isHeavy);

  for (let i = 0; i < userCount; i++) {
    const user = await prisma.user.create({
      data: {
        name: faker.person.fullName(),
        email: faker.internet.email(),
        password: password,
      },
    });

    console.log(`Created random user: ${user.email}`);
    await seedUserData(user, isHeavy);
  }

  console.log('Seeding finished.');
}

async function seedUserData(user: any, isHeavy: boolean) {
    // Create subjects
    const subjectCount = faker.number.int({ min: 5, max: 8 });
    const subjects = [];
    
    for (let j = 0; j < subjectCount; j++) {
      const subject = await prisma.subject.create({
        data: {
          userId: user.id,
          name: faker.helpers.arrayElement(['TypeScript', 'Angular', 'React', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Python', 'Machine Learning', 'Data Structures']),
          targetStudyHours: faker.number.int({ min: 20, max: 100 }),
          examDate: faker.date.future({ years: 0.5 }),
          createdAt: faker.date.past({ years: 0.1 })
        },
      });
      subjects.push(subject);

      // Create tasks
      const taskCount = faker.number.int({ min: 10, max: 20 });
      for (let k = 0; k < taskCount; k++) {
        await prisma.task.create({
          data: {
            userId: user.id,
            subjectId: subject.id,
            title: faker.lorem.sentence({ min: 3, max: 5 }),
            priority: faker.helpers.arrayElement(['low', 'medium', 'high']),
            status: faker.helpers.arrayElement(['pending', 'completed']),
            dueDate: faker.helpers.maybe(() => faker.date.recent({ days: 10 }), { probability: 0.7 }),
          },
        });
      }

      // Create study sessions
      const sessionCount = isHeavy ? 100 : faker.number.int({ min: 20, max: 50 });
      for (let s = 0; s < sessionCount; s++) {
        const date = faker.date.recent({ days: 30 });
        const startHour = faker.number.int({ min: 8, max: 20 });
        const duration = faker.number.int({ min: 1, max: 3 });
        
        await prisma.studySession.create({
          data: {
            userId: user.id,
            subjectId: subject.id,
            date: date,
            startTime: `${startHour.toString().padStart(2, '0')}:00`,
            endTime: `${(startHour + duration).toString().padStart(2, '0')}:00`,
            status: faker.helpers.arrayElement(['scheduled', 'completed', 'cancelled']),
          },
        });
      }
    }

    // Create notifications
    const notificationCount = faker.number.int({ min: 15, max: 30 });
    for (let n = 0; n < notificationCount; n++) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          title: faker.lorem.words(3),
          message: faker.lorem.sentence(),
          type: faker.helpers.arrayElement(['study_reminder', 'exam_alert', 'task_due', 'planner_update', 'system']),
          isRead: faker.datatype.boolean(),
          createdAt: faker.date.recent({ days: 7 }),
        },
      });
    }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
