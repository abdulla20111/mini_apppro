const screens = [...document.querySelectorAll(".screen")];
const toast = document.getElementById("toast");

function showScreen(id) {
  screens.forEach(screen => {
    screen.classList.remove("screen-active");
    screen.style.display = "none";
  });
  const target = document.getElementById(id);
  if (!target) return;
  target.style.display = "block";
  // Restart the entrance animation each time a section opens.
  target.classList.remove("screen-active");
  void target.offsetWidth;
  target.classList.add("screen-active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-open]").forEach(button => {
  button.addEventListener("click", () => showScreen(button.dataset.open));
});

document.querySelectorAll("[data-back]").forEach(button => {
  button.addEventListener("click", () => showScreen("homeScreen"));
});

// Telegram Web App integration is optional while developing in a normal browser.
if (window.Telegram?.WebApp) {
  const tg = window.Telegram.WebApp;
  tg.ready();
  tg.expand();
  document.documentElement.style.setProperty("--tg-bg", tg.themeParams.bg_color || "#090b12");
}

// Profil va admin huquqini Telegram Mini App ma’lumotlari orqali ko‘rsatish.
const ADMIN_TELEGRAM_ID = "6649277063";
const profileButton = document.querySelector(".profile-button");
const adminEditButton = document.getElementById("adminEditButton");

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function loadTelegramProfile() {
  const user = window.Telegram?.WebApp?.initDataUnsafe?.user;
  if (!user) return;

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Foydalanuvchi";
  document.getElementById("profileName").textContent = fullName;
  document.getElementById("profileAvatar").textContent = (user.first_name || "U").charAt(0).toUpperCase();
  document.getElementById("profileId").textContent = `Telegram ID: ${user.id}`;

  const isAdmin = String(user.id) === ADMIN_TELEGRAM_ID;
  if (isAdmin) {
    adminEditButton.hidden = false;
    document.getElementById("profileRole").textContent = "Admin";
  }
}

profileButton.addEventListener("click", () => {
  loadTelegramProfile();
  showScreen("profileScreen");
});

adminEditButton.addEventListener("click", () => {
  const tg = window.Telegram?.WebApp;
  const userId = tg?.initDataUnsafe?.user?.id;

  if (tg?.initData && String(userId) === ADMIN_TELEGRAM_ID) {
    window.location.href = "admin.html";
  } else {
    showToast("Bu bo‘lim faqat admin uchun.");
  }
});

loadTelegramProfile();
