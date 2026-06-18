import { serve } from "bun";
import index from "./frontend/index.html"

const { NODE_ENV, PORT } = process.env;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "http://localhost:5000", // Change * to your domain in production
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const server = serve({
  port: PORT || 3001,
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": NODE_ENV !== "production" && index,

    "/api/hello": {
      async GET(req) {
        return Response.json({
          message: "Hello, world!",
          method: "GET",
        }, { headers: CORS_HEADERS });
      },
      async PUT(req) {
        return Response.json({
          message: "Hello, world!",
          method: "PUT",
        }, { headers: CORS_HEADERS });
      },
    },

    "/api/hello/:name": async req => {
      const name = req.params.name;
      return Response.json({
        message: `Hello, ${name}!`,
      }, { headers: CORS_HEADERS });
    },
  },

  // async fetch(req) {
  //   if (process.env.NODE_ENV == "production") {
  //     const url = new URL(req.url);
  //     let filePath = `../dist${url.pathname === '/' ? '/index.html' : url.pathname}`;

  //     const file = Bun.file(filePath);
  //     if (await file.exists()) {
  //       return new Response(file);
  //     }

  //     // Fallback for SPA routing (e.g., React, Vue, Angular routers)
  //     const fallbackFile = Bun.file('../dist/index.html');
  //     if (await fallbackFile.exists()) {
  //       return new Response(fallbackFile);
  //     }
  //   }

  //   return new Response("Not found", { status: 404 });
  // },

  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
