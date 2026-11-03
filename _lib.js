const crypto = require("node:crypto");

const ADMIN_ID = process.env.ADMIN_TELEGRAM_ID || "6649277063";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

function send(res, status, body) {
  res.status(status).json(body);
}

function requireMethod(req, res, method) {
  if (req.method !== method) {
    res.setHeader("Allow", method);
    send(res, 405, { error: "Method not allowed" });
    return false;
  }
  return true;
}

function requireConfig(res) {
  if (!SUPABASE_URL || !SERVICE_KEY || !BOT_TOKEN) {
    send(res, 500, { error: "Server sozlamalari to‘liq emas. Vercel Environment Variables ni tekshiring." });
    return false;
  }
  return true;
}

function safeEqualHex(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(a, "hex"), Buffer.from(b, "hex"));
  } catch {
    return false;
  }
}

// Telegram Mini App initData ni Telegram hujjatlaridagi HMAC-SHA-256 usuli bilan tekshiradi.
function verifyTelegramInitData(initData) {
  if (!BOT_TOKEN || typeof initData !== "string" || !initData || initData.length > 10000) return null;

  const params = new URLSearchParams(initData);
  const receivedHash = params.get("hash");
  if (!receivedHash) return null;

  const authDate = Number(params.get("auth_date"));
  const now = Math.floor(Date.now() / 1000);
  if (!Number.isFinite(authDate) || authDate > now + 60 || now - authDate > 86400) return null;

  params.delete("hash");
  params.delete("signature");
  const dataCheckString = [...params.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(BOT_TOKEN).digest();
  const calculatedHash = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");
  if (!safeEqualHex(receivedHash, calculatedHash)) return null;

  try {
    const user = JSON.parse(params.get("user") || "null");
    if (!user || !Number.isInteger(Number(user.id))) return null;
    return {
      id: String(user.id),
      first_name: String(user.first_name || ""),
      last_name: String(user.last_name || ""),
      username: String(user.username || "")
    };
  } catch {
    return null;
  }
}

async function supabase(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SERVICE_KEY,
      Authorization: `Bearer ${SERVICE_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    }
  });
  const raw = await response.text();
  let data = null;
  try { data = raw ? JSON.parse(raw) : null; } catch { data = raw; }
  if (!response.ok) {
    const error = new Error(data?.message || data?.error || "Supabase so‘rovi bajarilmadi");
    error.status = response.status;
    throw error;
  }
  return data;
}

async function authenticate(req, res, adminOnly = false) {
  if (!requireConfig(res)) return null;
  const initData = req.headers["x-telegram-init-data"] || req.body?.initData;
  const user = verifyTelegramInitData(initData);
  if (!user) {
    send(res, 401, { error: "Telegram sessiyasi haqiqiy emas yoki eskirgan. Bot ichidan qayta oching." });
    return null;
  }

  const isAdmin = user.id === String(ADMIN_ID);
  try {
    await supabase("users?on_conflict=telegram_id", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify([{
        telegram_id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        role: isAdmin ? "admin" : "student"
      }])
    });
  } catch (error) {
    send(res, 500, { error: "Foydalanuvchini saqlashda xatolik: " + error.message });
    return null;
  }

  if (adminOnly && !isAdmin) {
    send(res, 403, { error: "Bu amal faqat administrator uchun." });
    return null;
  }
  return { ...user, isAdmin };
}

module.exports = { send, requireMethod, requireConfig, authenticate, supabase };
