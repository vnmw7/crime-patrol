const sql = require("../src/lib/supabase");
const { seed: seedUsers } = require("./seeders/users");

async function main() {
  try {
    console.log("Seeding users...");
    await seedUsers(sql);
    console.log("Users seeded successfully.");

    // Add other seeders here if needed

    console.log("Database seeded successfully.");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await sql.end();
  }
}

main();
