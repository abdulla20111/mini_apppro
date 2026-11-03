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

document.querySelector(".profile-button").addEventListener("click", () => {
  toast.textContent = "Profil bo‘limi keyingi bosqichda qo‘shiladi";
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
});
