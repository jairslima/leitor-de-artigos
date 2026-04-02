(function () {
  if (window.__leituraAvancadaForcadaLoaded) {
    return;
  }
  window.__leituraAvancadaForcadaLoaded = true;

  const OVERLAY_ID = "laf-reader-overlay";
  const BUTTON_ID = "laf-reader-toggle";
  const PICKER_ID = "laf-reader-picker";
  const CONTENT_ID = "laf-reader-content";
  const TITLE_ID = "laf-reader-title";
  const META_ID = "laf-reader-meta";

  let overlay;
  let floatingButton;
  let pickerButton;
  let isPicking = false;
  let lastPickedElement = null;
  let autoOpenTimer = null;

  const AUTO_OPEN_RULES = [
    {
      hostPattern: /(^|\.)dropsdocotidiano\.com$/i,
      pathPattern: /^\/\d{4}\/\d{2}\/\d{2}\//,
      minParagraphs: 3
    },
    {
      hostPattern: /.*/i,
      pathPattern: /^\/\d{4}\/\d{2}\/\d{2}\//,
      minParagraphs: 4
    },
    {
      hostPattern: /.*/i,
      pathPattern: /^\/(blog|noticia|noticias|artigo|artigos|post|posts)\//i,
      minParagraphs: 4
    }
  ];

  function createFloatingButton() {
    if (document.getElementById(BUTTON_ID)) {
      return;
    }

    floatingButton = document.createElement("button");
    floatingButton.id = BUTTON_ID;
    floatingButton.type = "button";
    floatingButton.textContent = "Leitura Avancada";
    floatingButton.title = "Abrir modo de leitura";
    floatingButton.addEventListener("click", toggleReaderMode);
    document.documentElement.appendChild(floatingButton);

    pickerButton = document.createElement("button");
    pickerButton.id = PICKER_ID;
    pickerButton.type = "button";
    pickerButton.textContent = "Selecionar bloco";
    pickerButton.title = "Selecionar manualmente a area principal";
    pickerButton.addEventListener("click", startPickerMode);
    document.documentElement.appendChild(pickerButton);
  }

  function createOverlay() {
    if (document.getElementById(OVERLAY_ID)) {
      overlay = document.getElementById(OVERLAY_ID);
      return overlay;
    }

    overlay = document.createElement("section");
    overlay.id = OVERLAY_ID;
    overlay.setAttribute("aria-hidden", "true");
    overlay.innerHTML = [
      '<div class="laf-reader-shell">',
      '  <header class="laf-reader-header">',
      '    <div class="laf-reader-header-copy">',
      '      <span class="laf-reader-badge">Modo de leitura</span>',
      `      <h1 id="${TITLE_ID}">Conteudo simplificado</h1>`,
      `      <p id="${META_ID}"></p>`,
      "    </div>",
      '    <div class="laf-reader-actions">',
      '      <button type="button" class="laf-reader-action" data-action="pick">Selecionar area</button>',
      '      <button type="button" class="laf-reader-action" data-action="decrease">A-</button>',
      '      <button type="button" class="laf-reader-action" data-action="increase">A+</button>',
      '      <button type="button" class="laf-reader-action" data-action="close">Fechar</button>',
      "    </div>",
      "  </header>",
      `  <article id="${CONTENT_ID}" class="laf-reader-article"></article>`,
      "</div>"
    ].join("");

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) {
        closeReaderMode();
      }
    });

    overlay.querySelector('[data-action="close"]').addEventListener("click", closeReaderMode);
    overlay.querySelector('[data-action="pick"]').addEventListener("click", () => {
      closeReaderMode();
      startPickerMode();
    });
    overlay.querySelector('[data-action="increase"]').addEventListener("click", () => adjustFontSize(1));
    overlay.querySelector('[data-action="decrease"]').addEventListener("click", () => adjustFontSize(-1));

    document.documentElement.appendChild(overlay);
    return overlay;
  }

  function adjustFontSize(direction) {
    const root = document.documentElement;
    const current = Number(root.dataset.lafReaderScale || "0");
    const next = Math.max(-2, Math.min(5, current + direction));
    root.dataset.lafReaderScale = String(next);
  }

  function sanitizeNode(source) {
    const clone = source.cloneNode(true);
    const blocked = [
      "script",
      "style",
      "noscript",
      "iframe",
      "svg",
      "canvas",
      "video",
      "audio",
      "form",
      "button",
      "input",
      "select",
      "textarea",
      "nav",
      "aside",
      "footer",
      ".sidebar",
      ".widget",
      ".sharedaddy",
      ".jp-relatedposts",
      ".cookie-notice",
      ".cookies",
      ".newsletter",
      "[id*='cookie']",
      "[class*='cookie']",
      "[aria-label*='cookie' i]",
      "[role='dialog']",
      "[role='alertdialog']",
      ".comment-respond",
      ".comments-area"
    ];

    clone.querySelectorAll(blocked.join(",")).forEach((node) => node.remove());

    clone.querySelectorAll("*").forEach((node) => {
      [...node.attributes].forEach((attribute) => {
        const name = attribute.name.toLowerCase();
        if (
          name.startsWith("on") ||
          name === "style" ||
          name === "class" ||
          name === "id" ||
          name === "role" ||
          name.startsWith("aria-")
        ) {
          node.removeAttribute(attribute.name);
        }
      });
    });

    clone.querySelectorAll("a").forEach((link) => {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    });

    clone.querySelectorAll("img").forEach((image) => {
      image.removeAttribute("srcset");
      image.removeAttribute("sizes");
      if (!image.getAttribute("alt")) {
        image.setAttribute("alt", "");
      }
    });

    return clone;
  }

  function scoreCandidate(node) {
    const text = (node.innerText || "").trim();
    const paragraphs = node.querySelectorAll("p");
    const headings = node.querySelectorAll("h1, h2, h3");
    const textLength = text.length;
    const linkPenalty = node.querySelectorAll("a").length * 18;
    const controlPenalty = node.querySelectorAll("button, input, nav, aside, form").length * 40;
    const imageBonus = node.querySelectorAll("img").length * 25;
    const paragraphBonus = paragraphs.length * 160;
    const headingBonus = headings.length * 30;
    const semanticBonus = /article|post|content|entry|main|texto|noticia/i.test(
      [node.id, node.className, node.getAttribute("role")].filter(Boolean).join(" ")
    )
      ? 500
      : 0;
    const densityBonus = Math.min(2000, textLength);
    return paragraphBonus + headingBonus + imageBonus + semanticBonus + densityBonus - linkPenalty - controlPenalty;
  }

  function findBestContentRoot() {
    const semanticMatch = document.querySelector(
      [
        "article",
        "main article",
        "main",
        "[role='main']",
        ".post",
        ".post-inner",
        ".post-content",
        ".post-entry",
        ".entry",
        ".entry-content",
        ".article",
        ".article-content",
        ".single-post",
        ".single .post",
        ".blog-post",
        ".content-area article",
        "#content article",
        "#main article",
        ".site-content article"
      ].join(", ")
    );
    if (semanticMatch && (semanticMatch.innerText || "").trim().length > 400) {
      return semanticMatch;
    }

    const candidates = Array.from(document.querySelectorAll("article, main, section, div"))
      .filter((node) => {
        const textLength = (node.innerText || "").trim().length;
        return textLength > 350 && node.querySelectorAll("p").length >= 2;
      })
      .sort((left, right) => scoreCandidate(right) - scoreCandidate(left));

    return candidates[0] || document.body;
  }

  function collectTitle() {
    const candidates = [
      "article .entry-title",
      "article .post-title",
      "article .title",
      ".single-post .entry-title",
      ".single .entry-title",
      ".content-area .entry-title",
      "#content .entry-title",
      "header.entry-header h1",
      ".post header h1",
      "article h1",
      ".entry-title",
      ".post-title",
      ".article-title",
      "main h1",
      "h1"
    ];

    for (const selector of candidates) {
      const element = document.querySelector(selector);
      const text = element?.textContent?.trim();
      if (text) {
        return text;
      }
    }

    return document.title || "Conteudo da pagina";
  }

  function normalizePageTitle(rawTitle) {
    if (!rawTitle) {
      return "Conteudo da pagina";
    }

    const cleaned = rawTitle
      .replace(/\s+[|\-–—]\s+.*$/, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    return cleaned || rawTitle.trim();
  }

  function removeObstructiveElements() {
    const selectors = [
      ".cookie-notice",
      ".cookies",
      ".cookie-banner",
      ".cli-bar-container",
      ".cky-consent-container",
      "[id*='cookie']",
      "[class*='cookie']",
      "[aria-label*='cookie' i]"
    ];

    selectors.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element) => {
        const text = (element.textContent || "").toLowerCase();
        if (text.includes("cookie") || text.includes("aceitar") || text.includes("privacidade")) {
          element.style.setProperty("display", "none", "important");
        }
      });
    });
  }

  function buildReadableArticle() {
    const root = lastPickedElement && document.contains(lastPickedElement)
      ? lastPickedElement
      : findBestContentRoot();
    const cleanRoot = sanitizeNode(root);
    const content = cleanRoot.innerHTML.trim();

    if (!content) {
      return {
        title: document.title || "Conteudo da pagina",
      meta: window.location.hostname,
      html: "<p>Nao foi possivel isolar o conteudo principal desta pagina.</p>"
      };
    }

    const firstHeading = root.querySelector("h1, h2");
    const rootHeadingText = firstHeading?.textContent?.trim();
    const pageHeadingText = collectTitle();
    const chosenTitle = pageHeadingText && rootHeadingText
      ? (pageHeadingText.length >= rootHeadingText.length ? pageHeadingText : rootHeadingText)
      : (pageHeadingText || rootHeadingText || document.title);
    const title = normalizePageTitle(chosenTitle);
    const paragraphCount = root.querySelectorAll("p").length;
    const wordCount = (root.innerText || "").trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(wordCount / 220));
    const meta = [
      window.location.hostname,
      `${paragraphCount} paragrafos`,
      `${minutes} min de leitura`
    ].join(" • ");

    return {
      title,
      meta,
      html: content
    };
  }

  function currentPageMatchesAutoOpenRule() {
    const { hostname, pathname } = window.location;
    return AUTO_OPEN_RULES.some((rule) => {
      if (!rule.hostPattern.test(hostname)) {
        return false;
      }

      if (rule.pathPattern && !rule.pathPattern.test(pathname)) {
        return false;
      }

      const root = findBestContentRoot();
      const paragraphCount = root.querySelectorAll("p").length;
      return paragraphCount >= (rule.minParagraphs || 1);
    });
  }

  function scheduleAutoOpen() {
    if (!currentPageMatchesAutoOpenRule()) {
      return;
    }

    if (document.documentElement.classList.contains("laf-reader-open")) {
      return;
    }

    if (autoOpenTimer) {
      clearTimeout(autoOpenTimer);
    }

    autoOpenTimer = setTimeout(() => {
      if (!document.documentElement.classList.contains("laf-reader-open")) {
        openReaderMode();
      }
    }, 900);
  }

  function openReaderMode() {
    const container = createOverlay();
    const article = buildReadableArticle();
    container.querySelector(`#${TITLE_ID}`).textContent = article.title;
    container.querySelector(`#${META_ID}`).textContent = article.meta;
    container.querySelector(`#${CONTENT_ID}`).innerHTML = article.html;
    container.setAttribute("aria-hidden", "false");
    document.documentElement.classList.add("laf-reader-open");
  }

  function closeReaderMode() {
    const container = createOverlay();
    container.setAttribute("aria-hidden", "true");
    document.documentElement.classList.remove("laf-reader-open");
  }

  function clearPickerVisuals() {
    document.querySelectorAll("[data-laf-reader-pick]").forEach((element) => {
      element.removeAttribute("data-laf-reader-pick");
    });
  }

  function stopPickerMode() {
    isPicking = false;
    document.documentElement.classList.remove("laf-picker-open");
    clearPickerVisuals();
  }

  function startPickerMode() {
    stopPickerMode();
    isPicking = true;
    document.documentElement.classList.add("laf-picker-open");
  }

  function onPointerMove(event) {
    if (!isPicking) {
      return;
    }

    const target = event.target?.closest("article, main, section, div, li");
    clearPickerVisuals();
    if (!target || target.id === OVERLAY_ID || target.id === BUTTON_ID || target.id === PICKER_ID) {
      return;
    }
    target.setAttribute("data-laf-reader-pick", "hover");
  }

  function onClickCapture(event) {
    if (!isPicking) {
      return;
    }

    const target = event.target?.closest("article, main, section, div, li");
    if (!target || target.id === OVERLAY_ID || target.id === BUTTON_ID || target.id === PICKER_ID) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    lastPickedElement = target;
    stopPickerMode();
    openReaderMode();
  }

  function toggleReaderMode() {
    const container = createOverlay();
    const isOpen = container.getAttribute("aria-hidden") === "false";
    if (isOpen) {
      closeReaderMode();
      return;
    }
    openReaderMode();
  }

  chrome.runtime.onMessage.addListener((message) => {
    if (message?.type === "toggle-reader-mode") {
      toggleReaderMode();
    }
  });

  document.addEventListener("pointermove", onPointerMove, true);
  document.addEventListener("click", onClickCapture, true);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.documentElement.classList.contains("laf-reader-open")) {
      closeReaderMode();
      return;
    }

    if (event.key === "Escape" && isPicking) {
      stopPickerMode();
    }
  });

  createFloatingButton();
  removeObstructiveElements();
  scheduleAutoOpen();
})();
