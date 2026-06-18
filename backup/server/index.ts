import { SQL } from "bun";
import indexPage from "../frontend/index.html";

// Simple in-memory session database
type SessionData = {
    username?: string;
    views: number;
} | undefined;

const sessionStore = new Map<string, SessionData>();

const PORT = process.env.PORT || 3000;
const pg = new SQL(process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/mydb");

function getSession(req: Request) {
    // 1. Extract existing Session ID from cookies
    const cookieHeader = req.headers.get("Cookie") || "";
    let sessionId = cookieHeader.match(/session_id=([^;]+)/)?.[1];
    let session: SessionData = sessionId ? sessionStore.get(sessionId) : undefined;

    // 2. Provision a new session if none exists
    if (!session) {
        session = { views: 0 };
        sessionId = Bun.randomUUIDv7();
        sessionStore.set(sessionId, session);
        // res.headers.set("Set-Cookie", `session_id=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax`);
    }

    // 3. Mutate or read the session data
    session.views += 1;

    return session;
}

Bun.serve({
    port: 3000,
    routes: {
        "/guests": async (req) => {
            const session = getSession(req);
            if (session.username !== 'admin') {
                return Response.json({ error: "Unauthorized" }, { status: 401 });
            }
            const rows = await pg`SELECT * FROM guests`.values();
            return Response.json(rows);
        },

        // SPA fallback — serve index.html for all unmatched routes
        "/*": indexPage,
    },
});

console.log(`\n🌹  Wedding site running at http://localhost:${PORT}`);
console.log(`   Demo codes: DEMO2026  |  WEDDING  |  EJ2026 (admin)\n`);
