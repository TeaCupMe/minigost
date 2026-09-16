const fs = require("fs");
const path = require("path");

const root = __dirname;
const dist = path.join(root, "dist");
const contentDir = path.join(root, "content");
const staticDir = path.join(root, "src", "static");

const site = readJson("site.json");
const catalog = readJson("gosts.json");
const allGosts = catalog.map((item) => readJson(`${item.id}.json`));

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });
copyDir(staticDir, dist);

write("index.html", homePage());
write("katalog.html", catalogPage());
write("404.html", notFoundPage());

allGosts.forEach((gost) => {
  gost.chapters.forEach((chapter, index) => {
    const file =
      index === 0
        ? `${gostBase(gost)}/index.html`
        : `${gostBase(gost)}/${chapter.id}.html`;
    write(file, chapterPage(gost, chapter, index));
  });
});

function gostBase(gost) {
  return `/gosts/${gost.id}`;
}

function homePage() {
  const cards = catalog
    .map(
      (gost) => `
        <article class="gost-card">
          <span class="code">${esc(gost.code)}</span>
          <h2>${esc(gost.title)}</h2>
          <p>${esc(gost.summary)}</p>
          <p class="status">${esc(gost.status)}</p>
          <div class="actions">
            <a class="button" href="/gosts/${esc(gost.id)}/">Открыть</a>
          </div>
        </article>
      `,
    )
    .join("");

  return layout({
    title: site.name,
    description: site.description,
    active: "home",
    body: `
      <section class="hero">
        <p class="eyebrow">${esc(site.audience)}</p>
        <h1>${esc(site.name)}</h1>
        <p class="lede">${esc(site.tagline)}. ${esc(site.description)}</p>
        <div class="actions">
          <a class="button" href="/katalog.html">Все стандарты</a>
        </div>
      </section>
      <div class="grid home-grid">
        <article class="panel">
          <h2>Что такое ГОСТ</h2>
          <p>ГОСТ — это государственная договорённость: как делать работу так, чтобы её понимали все. Если документы написаны по одним правилам, их проще читать, сравнивать и проверять.</p>
        </article>
        <article class="panel">
          <h2>Для кого сайт</h2>
          <p>Для студентов технических вузов и для всех, кому официальный язык стандартов кажется слишком плотным. Здесь сохранена структура документа, но фразы короче и проще — как объяснение «на пальцах».</p>
        </article>
        <article class="panel">
          <h2>Как читать</h2>
          <p>Как книгу: от главы к главе, кнопками «назад» и «дальше». Слева — оглавление. Сначала смысл стандарта и словарь, потом его разделы.</p>
        </article>
      </div>
      <div class="catalog-list" style="margin-top:1.2rem">${cards}</div>
    `,
  });
}

function catalogPage() {
  const cards = catalog
    .map(
      (gost) => `
        <article class="gost-card">
          <span class="code">${esc(gost.code)}</span>
          <h2>${esc(gost.title)}</h2>
          <p class="muted">${esc(gost.subtitle)}</p>
          <p>${esc(gost.summary)}</p>
          <p class="status">${esc(gost.status)}</p>
          <div class="actions">
            <a class="button" href="/gosts/${esc(gost.id)}/">Читать</a>
          </div>
        </article>
      `,
    )
    .join("");

  return layout({
    title: `Каталог — ${site.name}`,
    description: "Список стандартов, объяснённых простым языком.",
    active: "catalog",
    body: `
      <section class="hero">
        <p class="eyebrow">Справочник</p>
        <h1>Каталог ГОСТов</h1>
        <p class="lede">Каждый стандарт — отдельная книга с оглавлением. Новые можно добавлять таким же файлом с главами.</p>
      </section>
      <div class="catalog-list">${cards}</div>
    `,
  });
}

function chapterPage(gost, chapter, index) {
  const prev = gost.chapters[index - 1];
  const next = gost.chapters[index + 1];
  const blocks = chapter.blocks.map((block) => renderBlock(gost, block)).join("");

  return layout({
    title: `${chapter.title} — ${gost.code}`,
    description: chapter.lead,
    active: "catalog",
    body: `
      <nav class="crumbs" aria-label="Навигация">
        <a href="/">Главная</a> ·
        <a href="/katalog.html">Каталог</a> ·
        <span>${esc(gost.code)}</span>
      </nav>
      <div class="layout">
        <div class="side-wrap">
          <button class="nav-toggle" type="button" data-nav-toggle aria-expanded="false">Оглавление</button>
          ${toc(gost, index)}
        </div>
        <div>
          <p class="disclaimer">${esc(gost.disclaimer)}</p>
          <article class="article">
            <p class="eyebrow">${esc(gost.code)}</p>
            <h1>${esc(chapter.title)}</h1>
            <p class="lede">${inline(chapter.lead)}</p>
            ${blocks}
          </article>
          <nav class="pager" aria-label="Листать главы">
            ${
              prev
                ? `<a href="${chapterHref(gost, index - 1)}"><span class="dir">Назад</span>${esc(prev.nav)}</a>`
                : `<span class="empty"></span>`
            }
            ${
              next
                ? `<a class="next" href="${chapterHref(gost, index + 1)}"><span class="dir">Дальше</span>${esc(next.nav)}</a>`
                : `<span class="empty"></span>`
            }
          </nav>
        </div>
      </div>
    `,
  });
}

function notFoundPage() {
  return layout({
    title: `Страница не найдена — ${site.name}`,
    description: "Такой страницы нет.",
    active: "",
    body: `
      <section class="hero">
        <p class="eyebrow">404</p>
        <h1>Такой страницы нет</h1>
        <p class="lede">Проверьте адрес или вернитесь к каталогу стандартов.</p>
        <div class="actions">
          <a class="button" href="/">На главную</a>
          <a class="button button-ghost" href="/katalog.html">Каталог</a>
        </div>
      </section>
    `,
  });
}

function toc(gost, currentIndex) {
  const items = gost.chapters
    .map((chapter, index) => {
      const current = index === currentIndex ? ' aria-current="page"' : "";
      return `<li><a href="${chapterHref(gost, index)}"${current}>${esc(chapter.nav)}</a></li>`;
    })
    .join("");

  return `
    <nav class="toc" data-side-nav aria-label="Оглавление">
      <h2>${esc(gost.code)}</h2>
      <ol>${items}</ol>
    </nav>
  `;
}

function renderBlock(gost, block) {
  switch (block.type) {
    case "p":
      return `<p>${inline(block.text)}</p>`;
    case "h2":
      return `<h2>${esc(block.text)}</h2>`;
    case "h3":
      return `<h3>${esc(block.text)}</h3>`;
    case "ul":
      return `<ul>${block.items.map((item) => `<li>${inline(item)}</li>`).join("")}</ul>`;
    case "ol":
      return `<ol>${block.items.map((item) => `<li>${inline(item)}</li>`).join("")}</ol>`;
    case "callout":
      return `<aside class="callout"><h3>${esc(block.title)}</h3><p>${inline(block.text)}</p></aside>`;
    case "note":
      return `<aside class="note"><p>${inline(block.text)}</p></aside>`;
    case "example":
      return `<aside class="example"><h3>${esc(block.title)}</h3><p>${inline(block.text)}</p></aside>`;
    case "flow":
      return `<ol class="flow">${block.steps
        .map((step, i) => `<li><span>Шаг ${i + 1}</span>${esc(step)}</li>`)
        .join("")}</ol>`;
    case "terms":
      return `<div class="terms">${gost.terms
        .map(
          (term) => `
            <article class="term-card">
              <h3>${esc(term.term)}</h3>
              <p>${inline(term.definition)}</p>
            </article>
          `,
        )
        .join("")}</div>`;
    default:
      throw new Error(`Unknown block type: ${block.type}`);
  }
}

function chapterHref(gost, index) {
  const chapter = gost.chapters[index];
  return index === 0 ? `${gostBase(gost)}/` : `${gostBase(gost)}/${chapter.id}.html`;
}

function crtechLogo() {
  return `<svg class="crtech-logo" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" aria-hidden="true">
    <circle cx="32" cy="32" r="32" fill="currentColor"/>
    <rect x="16.5" y="17" width="11" height="30" rx="5.5" fill="var(--logo-eyes)"/>
    <rect x="36.5" y="17" width="11" height="30" rx="5.5" fill="var(--logo-eyes)"/>
  </svg>`;
}

function crtechWordmark() {
  return `<span class="wordmark" aria-label="CrTech"><span class="wordmark-cr">Cr</span>Tech</span>`;
}

function layout({ title, description, active, body }) {
  return `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <link rel="stylesheet" href="/styles/main.css">
  <script>
    (() => {
      try {
        const stored = localStorage.getItem("theme");
        const theme = stored === "dark" || stored === "light"
          ? stored
          : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
        document.documentElement.dataset.theme = theme;
      } catch (error) {}
    })();
  </script>
</head>
<body>
  <a class="skip-link" href="#content">К тексту</a>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="/">
        ${crtechLogo()}
        <span>
          <span class="brand-name">${esc(site.name)}</span>
          <span class="brand-note">${crtechWordmark()} · ${esc(site.audience)}</span>
        </span>
      </a>
      <div class="header-actions">
        <nav class="nav-links" aria-label="Разделы сайта">
          <a href="/"${active === "home" ? ' aria-current="page"' : ""}>Главная</a>
          <a href="/katalog.html"${active === "catalog" ? ' aria-current="page"' : ""}>Каталог</a>
        </nav>
        <button class="theme-toggle" type="button" data-theme-toggle aria-label="Переключить тему">
          <svg class="icon-moon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 14.3A8.5 8.5 0 0 1 9.7 3 7 7 0 1 0 21 14.3z"/>
          </svg>
          <svg class="icon-sun" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 3v1.5M12 19.5V21M4.2 4.2l1.1 1.1M18.7 18.7l1.1 1.1M3 12h1.5M19.5 12H21M4.2 19.8l1.1-1.1M18.7 5.3l1.1-1.1"/>
          </svg>
        </button>
      </div>
    </div>
  </header>
  <main id="content">
    <div class="wrap">
      ${body}
    </div>
  </main>
  <footer class="site-footer">
    <div class="footer-inner">
      <a class="footer-brand" href="/" aria-label="CrTech">
        ${crtechLogo()}
        ${crtechWordmark()}
      </a>
      <p>Учебный пересказ смысла стандартов, не официальная публикация ГОСТ. Официальные тексты публикует Росстандарт.</p>
    </div>
  </footer>
  <script src="/js/main.js"></script>
</body>
</html>
`;
}

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(contentDir, name), "utf8"));
}

function write(relativePath, html) {
  const full = path.join(dist, relativePath.replace(/^[/\\]+/, ""));
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, html, "utf8");
}

function copyDir(from, to) {
  fs.cpSync(from, to, { recursive: true });
}

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function inline(value) {
  return esc(value).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
}
