(() => {
  const root = document.documentElement;
  const themeButton = document.querySelector("[data-theme-toggle]");

  const applyTheme = (theme) => {
    root.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch (error) {
      /* ignore quota / private mode */
    }
    if (themeButton) {
      themeButton.setAttribute(
        "aria-label",
        theme === "dark" ? "Включить светлую тему" : "Включить тёмную тему",
      );
    }
  };

  const stored = (() => {
    try {
      return localStorage.getItem("theme");
    } catch (error) {
      return null;
    }
  })();
  const initial =
    stored === "dark" || stored === "light"
      ? stored
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  applyTheme(initial);

  themeButton?.addEventListener("click", () => {
    applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
  });
})();

(() => {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-side-nav]");
  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
})();
