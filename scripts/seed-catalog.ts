import { PrismaClient, Prisma } from '@prisma/client';
import { API_CATALOG } from '../lib/api-catalog';
import bcrypt from 'bcryptjs';




const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    for (const api of API_CATALOG) {
        const existing = await prisma.api.findUnique({
            where: { slug: api.slug }
        });

        if (!existing) {
            console.log(`Creating API: ${api.name}`);

            const data: Prisma.ApiCreateInput = {
                id: api.id,
                slug: api.slug,
                name: api.name,
                shortDescription: api.shortDescription,
                longDescription: api.longDescription,
                category: api.category,
                subCategory: api.subCategory || null,
                tags: api.tags.join(','),
                pricingType: api.pricingType,
                regionSupport: api.regionSupport?.join(',') || null,
                dxScore: api.dxScore ?? 0,
                popularityScore: api.popularityScore ?? 0,
                logoUrl: api.logoUrl,
                logoSymbol: api.logoSymbol || null,
                docsUrl: api.docsUrl,
                providerUrl: api.providerUrl,
                providerName: api.providerName,
                confidenceScore: api.confidenceScore,
                rating: api.rating,
                reviewCount: api.reviewCount,
                uptimeSla: api.uptimeSla,
                sampleEndpointUrl: api.sampleEndpointUrl,
                playgroundExampleResponse: api.playgroundExampleResponse ? JSON.stringify(api.playgroundExampleResponse) : null,
                featured: api.isFeatured || false,
                source: 'manual',
                status: 'active',
                affiliateUrl: api.affiliateUrl,
                referralNote: api.referralNote,
            };

            await prisma.api.create({ data });
        } else {
            console.log(`Skipping existing API: ${api.name}`);
        }
    }

    // Create an admin user if not exists
    const adminEmail = 'admin@apiverse.com';
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
        console.log('Creating admin user...');
        const hashedPassword = await bcrypt.hash("admin", 10);

        await prisma.user.create({
            data: {
                email: adminEmail,
                name: 'Admin User',
                role: 'admin',
                password: hashedPassword
            }
        });
    } else {
        console.log('Admin user already exists.');
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
