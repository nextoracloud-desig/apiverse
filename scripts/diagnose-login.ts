
import { prisma } from "../lib/prisma";
const bcrypt = require("bcrypt");

async function main() {
    const email = "a@gmail.com";
    console.log(`Checking user: ${email}...`);

    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        console.log("❌ User NOT FOUND in the database that the app is connected to.");
        console.log("Tip: Check if DATABASE_URL in .env matches the one Prisma Studio is using.");
        return;
    }

    console.log("✅ User FOUND:");
    console.log(` - ID: ${user.id}`);
    console.log(` - Email: '${user.email}'`);
    console.log(` - Password in DB: '${user.password}'`);

    const inputPassword = "123456";
    console.log(`\nTesting password: '${inputPassword}'`);

    let isValid = false;
    if (!user.password) {
        console.log("❌ DB Password is NULL/Undefined");
    } else if (user.password.startsWith("$2") || user.password.startsWith("$1")) {
        console.log(" - Detected hashed password, attempting bcrypt compare...");
        isValid = await bcrypt.compare(inputPassword, user.password);
    } else {
        console.log(" - Detected plain text password, checking equality...");
        isValid = user.password === inputPassword;
    }

    if (isValid) {
        console.log("✅ Password match successful. Login SHOULD work.");
    } else {
        console.log("❌ Password match FAILED.");
        console.log(`   Expected: '${user.password}'`);
        console.log(`   Got: '${inputPassword}'`);
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
