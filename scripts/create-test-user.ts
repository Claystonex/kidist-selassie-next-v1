import { db } from "../src/server/db";

async function createTestUser() {
  const testUser = await db.user.create({
    data: {
      emailAddress: "test@example.com", // Change to your desired test email
      firstName: "Test",
      lastName: "User",
      onboardingCompleted: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
  
  console.log("Test user created successfully:");
  console.log(testUser);
  
  await db.$disconnect();
}

createTestUser()
  .catch(error => {
    console.error("Error creating test user:", error);
    process.exit(1);
  });
