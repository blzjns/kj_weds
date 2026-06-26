import type { Guest } from "@/types/guest";
import { sql } from "bun";

// const sql = new SQL({
//     url: process.env.DATABASE_URL,
//     max: 10, // Reduce maximum connections if hitting server limits
//     idleTimeout: 0, // 0 disables idle closing, or set it higher (in seconds)
// });

const { DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD } = process.env;
if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
    throw new Error('Missing database credentials');
}

// const sql = new SQL({
//     hostname: DB_HOST,
//     port: DB_PORT,
//     username: DB_USER,
//     password: DB_PASSWORD,
//     database: DB_NAME,
//     tls: true // 👈 Critical for Render SSL requirement
// });

export enum GuestStatus { NotFound, Unauthorized, InvalidCode };

const SESSION_TTL = '60 minutes';
const buildDBSessionQuery = (sessionId: string) => `select guest_id from sessions where id = '${sessionId}' and created_at >= (now() - interval '${SESSION_TTL}')`;

export async function isLoggedIn(req: Bun.BunRequest): Promise<boolean> {
    const sessionGuest = await getSessionGuest(req);
    return typeof sessionGuest !== 'number'; // if it's a number, it's a GuestStatus, not a guest
}

export async function getSessionGuest(req: Bun.BunRequest): Promise<Guest | GuestStatus> {
    // get guest from session id
    const sessionId = req.cookies.get("session-id");
    if (!!sessionId) {
        const rows = await sql.unsafe(`select * from guests where id = (${buildDBSessionQuery(sessionId)})`);
        const guest: Guest = rows[0];
        if (!!guest) return { ...guest, sessionId };
    }

    // not logged in and method is GET -> return unauthorized
    if (req.method === 'GET') return GuestStatus.Unauthorized;

    // get guest from db with guest code
    const body: { code: string } = await req.json();
    if (!body.code) return GuestStatus.InvalidCode;
    const code = (body.code).toUpperCase().trim();

    const rows = await sql`select * from guests where code = ${code}::text`;
    const guest: Guest = rows[0];
    if (!!guest) {
        const newSessionId = Bun.randomUUIDv7();
        await sql`insert into sessions (id, guest_id) values (${newSessionId}, ${guest.id}) 
            on conflict (guest_id) 
            do update set 
                id = ${newSessionId},
                created_at = default`;

        return { ...guest, sessionId: newSessionId };
    }

    // No guest found
    return GuestStatus.NotFound;
}