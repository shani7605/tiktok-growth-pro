require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json({ limit: "30kb" }));
app.use(cookieParser());
app.use(express.static("public"));
app.use("/auth", rateLimit({ windowMs: 60_000, limit: 20 }));

const {
  PORT = 3000,
  APP_BASE_URL,
  TIKTOK_CLIENT_KEY,
  TIKTOK_CLIENT_SECRET,
  TIKTOK_REDIRECT_URI,
  SESSION_SECRET
} = process.env;

function configured() {
  return Boolean(TIKTOK_CLIENT_KEY && TIKTOK_CLIENT_SECRET &&
    TIKTOK_REDIRECT_URI && SESSION_SECRET &&
    !TIKTOK_CLIENT_KEY.startsWith("PUT_") &&
    !TIKTOK_CLIENT_SECRET.startsWith("PUT_") &&
    SESSION_SECRET !== "REPLACE_WITH_A_LONG_RANDOM_SECRET");
}

function safeEqual(a, b) {
  const aa = Buffer.from(String(a || ""));
  const bb = Buffer.from(String(b || ""));
  return aa.length === bb.length && crypto.timingSafeEqual(aa, bb);
}

app.get("/api/status", (_req, res) => {
  res.json({
    ok: true,
    app: "TikTok Growth Pro",
    tiktokConfigured: configured(),
    mode: "starter"
  });
});

// OAuth start: TikTok handles the user's login and consent.
// Never collect a TikTok password in this app.
app.get("/auth/tiktok", (req, res) => {
  if (!configured()) {
    return res.status(503).send("TikTok OAuth is not configured. Add your approved app credentials to .env.");
  }
  const state = crypto.randomBytes(32).toString("hex");
  res.cookie("tiktok_oauth_state", state, {
    httpOnly: true,
    sameSite: "lax",
    secure: String(APP_BASE_URL || "").startsWith("https://"),
    maxAge: 5 * 60 * 1000
  });
  const url = new URL("https://www.tiktok.com/v2/auth/authorize/");
  url.search = new URLSearchParams({
    client_key: TIKTOK_CLIENT_KEY,
    response_type: "code",
    scope: "user.info.basic,user.info.stats,video.list",
    redirect_uri: TIKTOK_REDIRECT_URI,
    state
  }).toString();
  res.redirect(url.toString());
});

app.get("/auth/tiktok/callback", async (req, res) => {
  const { code, state, error, error_description } = req.query;
  const savedState = req.cookies.tiktok_oauth_state;
  res.clearCookie("tiktok_oauth_state");
  if (error) return res.status(400).send("TikTok authorization was not completed: " +
    String(error_description || error).slice(0, 250));
  if (!code || !state || !safeEqual(state, savedState)) {
    return res.status(400).send("Authorization could not be verified. Please try connecting again.");
  }
  if (!configured()) return res.status(503).send("Server OAuth settings are incomplete.");
  try {
    const body = new URLSearchParams({
      client_key: TIKTOK_CLIENT_KEY,
      client_secret: TIKTOK_CLIENT_SECRET,
      code: String(code),
      grant_type: "authorization_code",
      redirect_uri: TIKTOK_REDIRECT_URI
    });
    const response = await fetch("https://open.tiktokapis.com/v2/oauth/token/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });
    const data = await response.json();
    if (!response.ok || data.error) {
      console.error("TikTok token exchange failed:", data.error || response.status);
      return res.status(502).send("TikTok token exchange failed. Check app approval and redirect URI.");
    }

    // IMPORTANT: This starter intentionally does not persist tokens or create user accounts.
    // Add encrypted server-side token storage and authenticated user ownership before public launch.
    // Do not send access_token or refresh_token to the browser.
    res.type("html").send(`<!doctype html><meta name="viewport" content="width=device-width">
      <title>Connection response</title><h2>TikTok authorization completed</h2>
      <p>TikTok returned an authorization token. This starter did not save it.</p>
      <p>Before public launch, implement encrypted server-side token storage, user accounts,
      disconnect/revoke handling, privacy policy and security review.</p>
      <a href="/">Return to dashboard</a>`);
  } catch (e) {
    console.error("OAuth callback error:", e.message);
    res.status(502).send("Could not contact TikTok. Please try again later.");
  }
});

app.get("/api/tiktok/profile", (_req, res) => {
  res.status(501).json({
    error: "not_implemented",
    message: "After OAuth, add encrypted token storage and call TikTok user info API from the server."
  });
});

app.get("*", (_req, res) => res.sendFile(require("path").join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`TikTok Growth Pro running on port ${PORT}`));
