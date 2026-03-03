import { Pool } from "pg";
import * as bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
import { config } from "dotenv";

// Load environment variables from .env
config({ path: ".env" });

const connectionString = process.env.DATABASE_URL?.includes("${")
    ? `postgresql://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`
    : process.env.DATABASE_URL;

const pool = new Pool({
    connectionString,
});

async function main() {
    const email = process.env.ADMIN_EMAIL || "admin@payguard.dev";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const name = process.env.ADMIN_NAME || "Admin";

    const hashedPassword = await bcrypt.hash(password, 12);
    const newId = uuidv4();

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        // Upsert admin user
        const query = `
            INSERT INTO "Admin" (id, email, password, name)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (email) DO UPDATE
            SET password = EXCLUDED.password, name = EXCLUDED.name;
        `;

        await client.query(query, [newId, email, hashedPassword, name]);

        await client.query("COMMIT");
        console.log(`✅ Admin user seeded: ${email}`);
    } catch (e) {
        await client.query("ROLLBACK");
        console.error("❌ Seed failed:", e);
        process.exit(1);
    } finally {
        client.release();
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => {
        pool.end();
    });
