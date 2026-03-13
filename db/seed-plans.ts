import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seedPlans() {
    console.log("Seeding default plans...");

    // Upsert Starter (free) plan
    const starter = await prisma.plan.upsert({
        where: { slug: "starter" },
        update: {},
        create: {
            slug: "starter",
            name: "Starter",
            description: "Perfect for trying it out on small gigs.",
            price: 0,
            currency: "USD",
            billingType: "free",
            isDefault: true,
            isPopular: false,
            isActive: true,
            sortOrder: 0,
            projectLimit: 3,
            fileLimit: 20,
            features: JSON.stringify([
                "Up to 3 active projects",
                "Developer & Designer modes",
                "Up to 20 files per design project",
                "Community support",
            ]),
        },
    });

    // Upsert Enterprise (paid) plan
    const enterprise = await prisma.plan.upsert({
        where: { slug: "enterprise" },
        update: {},
        create: {
            slug: "enterprise",
            name: "Enterprise",
            description: "For serious freelancers and agencies.",
            price: 1500, // $15.00 in cents
            currency: "USD",
            billingType: "one_time",
            isDefault: false,
            isPopular: true,
            isActive: true,
            sortOrder: 1,
            projectLimit: -1, // unlimited
            fileLimit: -1, // unlimited
            features: JSON.stringify([
                "Unlimited active projects",
                "Developer & Designer modes",
                "Unlimited file uploads",
                "Remove Check 402 branding (Soon)",
                "Priority support",
            ]),
        },
    });

    console.log(`Seeded plans: ${starter.name} (${starter.slug}), ${enterprise.name} (${enterprise.slug})`);

    // Migrate existing users: assign planId based on their plan string
    const starterUsers = await prisma.user.updateMany({
        where: { plan: "DEVELOPER", planId: null },
        data: { planId: starter.id },
    });
    const enterpriseUsers = await prisma.user.updateMany({
        where: { plan: "ENTERPRISE", planId: null },
        data: { planId: enterprise.id },
    });

    console.log(`Migrated ${starterUsers.count} users to Starter, ${enterpriseUsers.count} to Enterprise`);
}

seedPlans()
    .catch((e) => {
        console.error("Seed failed:", e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
