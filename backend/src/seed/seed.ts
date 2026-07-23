import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { sequelize } from "../db/sequelize";
import "../models";
import { Attribute, User } from "../models";

const SYSTEM_ATTRIBUTES: Array<[string, string, string]> = [
  ["First Name", "Personal Information", "string"],
  ["Last Name", "Personal Information", "string"],
  ["Location", "Personal Information", "string"],
  ["Photo", "Personal Information", "image"],
];

const SAMPLE_ATTRIBUTES: Array<{
  name: string;
  category: string;
  dataType: string;
  description: string;
  options?: string[];
}> = [
  { name: "English Level", category: "Language", dataType: "one_of_many", description: "CEFR proficiency", options: ["A2", "B1", "B2", "C1", "C2"] },
  { name: "IELTS Score", category: "Language", dataType: "numeric", description: "Overall IELTS band score" },
  { name: "GPA", category: "Domain Knowledge", dataType: "numeric", description: "Academic grade point average" },
  { name: "Remote Work", category: "Personal Information", dataType: "boolean", description: "Open to fully remote roles" },
  { name: "Presentation Skills", category: "Soft Skills", dataType: "one_of_many", description: "Self-assessed presentation ability", options: ["Beginner", "Intermediate", "Advanced"] },
  { name: "AWS Certified", category: "Certification", dataType: "boolean", description: "Holds an active AWS certification" },
  { name: "Years of Experience", category: "Domain Knowledge", dataType: "numeric", description: "Total professional experience in years" },
];

async function main() {
  await sequelize.sync();

  for (const [name, category, dataType] of SYSTEM_ATTRIBUTES) {
    await Attribute.findOrCreate({
      where: { name },
      defaults: { name, category: category as any, dataType: dataType as any, description: "Built-in profile field", isSystem: true } as any,
    });
  }

  for (const a of SAMPLE_ATTRIBUTES) {
    await Attribute.findOrCreate({
      where: { name: a.name },
      defaults: { ...a, options: a.options ?? null } as any,
    });
  }

  const demoUsers = [
    { email: "admin@demo.io", password: "password123", roles: ["admin", "recruiter", "candidate"] },
    { email: "recruiter@demo.io", password: "password123", roles: ["recruiter"] },
    { email: "candidate@demo.io", password: "password123", roles: ["candidate"] },
  ];
  for (const u of demoUsers) {
    const existing = await User.findOne({ where: { email: u.email } });
    if (!existing) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      await User.create({ email: u.email, passwordHash, roles: u.roles } as any);
    }
  }

  console.log("Seed complete. Demo logins (password: password123):");
  demoUsers.forEach((u) => console.log(`  ${u.email}  [${u.roles.join(", ")}]`));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
