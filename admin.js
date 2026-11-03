// Demo gate: this checks the Telegram Mini App user ID in the browser.
// IMPORTANT: This is NOT secure authorization by itself. Verify Telegram initData
// on a trusted server before enabling real admin actions or private video access.
const ADMIN_TELEGRAM_ID = "6649277063";

const checking = document.getElementById("checking");
const denied = document.getElementById("denied");
const panel = document.getElementById("adminPanel");
const reason = document.getElementById("deniedReason");

function showDenied(message) {
  checking.classList.add("hidden");
  panel.classList.add("hidden");
  denied.classList.remove("hidden");
  reason.textContent = message;
}

function showAdmin(userId) {
  checking.classList.add("hidden");
  denied.classList.add("hidden");
  panel.classList.remove("hidden");
  document.getElementById("adminId").textContent = userId;
}

(function checkAdmin() {
  const tg = window.Telegram && window.Telegram.WebApp;

  if (!tg || !tg.initData) {
    showDenied("Admin sahifasini Telegram bot ichidagi Mini App orqali oching.");
    return;
  }

  tg.ready();
  tg.expand();

  // initDataUnsafe is used only for this preliminary UI gate.
  const userId = tg.initDataUnsafe?.user?.id;
  if (userId && String(userId) === ADMIN_TELEGRAM_ID) {
    showAdmin(String(userId));
  } else {
    showDenied("Sizning Telegram ID raqamingiz admin ro‘yxatiga mos kelmadi.");
  }
})();
