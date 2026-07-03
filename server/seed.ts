import { runSeed } from "./seedCore.ts";

console.log("Seeding database (this resets all tables)...");
const { counts, total } = runSeed();
console.log("Seed complete:", counts, "total rows:", total);
