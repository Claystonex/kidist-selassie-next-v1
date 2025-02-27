import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Database seeding completed');
  // Note: We no longer need to seed categories since we're using PostType enum
  // PostTypes are defined in the schema.prisma file as an enum
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
