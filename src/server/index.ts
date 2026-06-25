import { serve } from "bun";
import index from "../frontend/index.html"
import { getSessionGuest, GuestStatus, isLoggedIn } from "./guestHandler";
import { SESSION_MAX_AGE } from "@/session.constants";
import { getFile, listFiles, uploadFile } from "./storage";


const { NODE_ENV, PORT, } = process.env;

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "http://localhost:5000", // Change * to your domain in production
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const UNAUTHORIZED = new Response('Unauthorized', { status: 401 });

const server = serve({
  port: PORT || 3001,
  routes: {
    // Serve index.html for all unmatched routes.
    // "/*": NODE_ENV !== "production" && index,
    "/*": index,

    // Google Drive
    '/api/photos': {
      async GET(req) {
        if (!await isLoggedIn(req)) return UNAUTHORIZED;
        const images = await listFiles();
        return Response.json(images);
      }
    },
    // Google Drive
    '/api/photos/:key': {
      async GET(req) {
        if (!await isLoggedIn(req)) return UNAUTHORIZED;

        const key = req.params.key;
        if (!key) return new Response('Missing file key', { status: 400 });

        const file = getFile(key);
        return new Response(file);
      }
    },
    '/api/photos/upload': {
      async POST(req) {
        if (!await isLoggedIn(req)) return UNAUTHORIZED;

        const formData = await req.formData();
        const file = formData.get('photo') as File;

        await uploadFile(file);

        const images = await listFiles();
        return Response.json(images);
      }
    },

    // // Google Photos
    // '/api/photos': {
    //   async GET(req) {
    //     const authUrl = oauth2Client.generateAuthUrl({
    //       access_type: 'offline',
    //       scope: [
    //         "https://www.googleapis.com/auth/photoslibrary.readonly.appcreateddata",
    //         "https://www.googleapis.com/auth/photoslibrary.readonly",
    //         "https://www.googleapis.com/auth/photoslibrary.appendonly",
    //         "https://www.googleapis.com/auth/userinfo.profile"
    //       ],
    //       include_granted_scopes: true
    //     });

    //     return Response.redirect(authUrl);
    //   }
    // },

    // '/auth/google/callback': {
    //   async GET(req) {
    //     try {
    //       const url = new URL(req.url);
    //       const code = url.searchParams.get("code") || '';

    //       const { tokens } = await oauth2Client.getToken(code);
    //       oauth2Client.setCredentials(tokens);

    //       // OPTIONAL: Store tokens securely in a database associated with your user
    //       console.log("Tokens acquired:", tokens);

    //       // Immediately leverage the token to call a Google API (e.g., Oauth2 Profile API)
    //       // const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    //       // const userInfo = await oauth2.userinfo.get();

    //       const accessToken = (await oauth2Client.getAccessToken()).token;

    //       const now = Date.now()
    //       const newAlbum = {
    //         "id": `My new album ${now}`,
    //         "title": `Title ${now}`,
    //         // "productUrl": `My new album ${Date.now()}`,
    //         // "isWriteable": boolean,
    //         // "shareInfo": {
    //         // object(ShareInfo)
    //         //
    //         // "mediaItemsCount": string,
    //         // "coverPhotoBaseUrl": string, },
    //         "coverPhotoMediaItemId": `myNewAlbum---${now}`
    //       }

    //       const albumResponse = await fetch(`https://photoslibrary.googleapis.com/v1/albums`, {
    //         method: 'POST',
    //         headers: {
    //           Authorization: `Bearer ${accessToken}`,
    //           'Content-Type': 'application/json'
    //         },
    //         body: JSON.stringify({
    //           album: newAlbum
    //         })
    //       });

    //       const albumJson = await albumResponse.json();
    //       console.log("Album created:", albumJson);

    //       const response = await fetch(`https://photoslibrary.googleapis.com/v1/mediaItems?pageSize=10&pageToken=`, {
    //         method: 'GET',
    //         headers: {
    //           Authorization: `Bearer ${accessToken}`,
    //           'Content-Type': 'application/json'
    //         }
    //       });

    //       const json = await response.json();

    //       // if (!mediaItems || mediaItems.length === 0) {
    //       //   console.log('No media items found.');
    //       //   return;
    //       // }

    //       // // 3. Process the returned media items
    //       // mediaItems.forEach(item => {
    //       //   console.log(`File Name: ${item.filename}`);
    //       //   console.log(`ID: ${item.id}`);
    //       //   console.log(`Base URL: ${item.baseUrl}`); // Use this URL to download/display the item
    //       //   console.log(`Mime Type: ${item.mimeType}`);
    //       //   console.log('------------------------------------');
    //       // });

    //       // // Check for pagination token if you need to fetch more files
    //       // if (response.data.nextPageToken) {
    //       //   console.log(`Next Page Token: ${response.data.nextPageToken}`);
    //       // }

    //       return Response.json({
    //         message: "Authentication successful!",
    //         photos: json.data
    //       });

    //     } catch (error) {
    //       console.error("Error exchanging code for token:", error);
    //       return Response.json({ error: 'Authentication failed.' }, { status: 500 });
    //     }
    //   }
    // },

    // Auth
    '/api/auth/login': {
      async POST(req) {
        const sessionGuest = await getSessionGuest(req);
        switch (sessionGuest) {
          case GuestStatus.InvalidCode:
            return Response.json({ ok: false, error: 'Invalid code' }, { status: 400 });
          case GuestStatus.NotFound:
            return Response.json({ ok: false, error: 'Not found' }, { status: 404 });
          case GuestStatus.Unauthorized:
            return Response.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
          default:
            const headers = { ...CORS_HEADERS, "Set-Cookie": `session-id=${sessionGuest.sessionId}; SameSite=Lax; Path=/; Secure; Max-Age=${SESSION_MAX_AGE}` };
            delete sessionGuest.code;
            delete sessionGuest.id;
            delete sessionGuest.created_at;
            return Response.json({ ok: true, guest: sessionGuest }, { status: 200, headers });
        }

        // if (sessionGuest !== null) return Response.json({ ok: true, guest: sessionGuest }, { status: 200 });

        // req.session.guest = { id: guest.id, name: guest.name, code: guest.code, tag: guest.tag };
        // res.json({ ok: true, guest: { name: guest.name, tag: guest.tag } });


        // return Response.json({ ok: true, guest: { name: guest.name, role: guest.role } }, { headers });
      }
    },

    // /** POST /api/auth/logout */
    // app.post('/api/auth/logout', (req, res) => {
    //   req.session.destroy();
    //   res.json({ ok: true });
    // });

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
  development: process.env.NODE_ENV !== "production" && {
    // Enable browser hot reloading in development
    hmr: true,

    // Echo console logs from the browser to the server
    console: true,
  },
});

// Start app
console.log(`\n🌹  Wedding site running at ${server.url}`);
console.log(`    Demo codes: DEMO2026  |  WEDDING  |  EJ2026 (admin)\n`);
