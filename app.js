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

async function loadTelegramProfile() {
  const tg = window.Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;
  if (!user || !tg?.initData) return;

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || "Foydalanuvchi";
  document.getElementById("profileName").textContent = fullName;
  document.getElementById("profileAvatar").textContent = (user.first_name || "U").charAt(0).toUpperCase();
  document.getElementById("profileId").textContent = `Telegram ID: ${user.id}`;

  try {
    const response = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ initData: tg.initData })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Tekshiruv amalga oshmadi");

    const isAdmin = result.role === "admin";
    adminEditButton.hidden = !isAdmin;
    document.getElementById("profileRole").textContent =
      isAdmin ? "Admin" : (result.status === "approved" ? "Tasdiqlangan o‘quvchi" : "Tasdiq kutilmoqda");
  } catch (error) {
    adminEditButton.hidden = true;
    document.getElementById("profileRole").textContent = "Server tekshiruvi mavjud emas";
    console.error("Academy auth:", error);
  }
}

profileButton.addEventListener("click", () => {
  loadTelegramProfile();
  showScreen("profileScreen");
});

adminEditButton.addEventListener("click", () => {
  const tg = window.Telegram?.WebApp;
  if (!tg?.initData) {
    showToast("Admin bo‘limi Telegram ichida ochiladi.");
    return;
  }
  fetch("/api/auth", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData: tg.initData })
  })
    .then(async response => {
      const result = await response.json();
      if (!response.ok || result.role !== "admin") throw new Error("Ruxsat yo‘q");
      window.location.href = "admin.html";
    })
    .catch(() => showToast("Bu bo‘lim faqat admin uchun."));
});

loadTelegramProfile();
