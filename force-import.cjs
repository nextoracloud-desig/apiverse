const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const p = new PrismaClient();

(async () => {
  const f1 = path.join(process.cwd(), "data/apiverse_providers_1.json");
  const f2 = path.join(process.cwd(), "data/apiverse_providers_2.json");

  const list1 = JSON.parse(fs.readFileSync(f1, "utf8"));
  const list2 = JSON.parse(fs.readFileSync(f2, "utf8"));

  const apis = [...list1, ...list2];

  console.log("TOTAL FOUND:", apis.length);

  let c = 0;
  for (const api of apis) {
    try {
      await p.apiProvider.upsert({
        where: { id: api.id },
        update: api,
        create: api,
      });
      c++;
    } catch (e) {
      console.log("ERR:", api.id);
    }
  }

  console.log("Done! Imported:", c);
  await p.$disconnect();
})();
