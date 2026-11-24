(() => {
  const D = window.DONA_MARTA_DATA;
  const $ = (sel, root = document) => root.querySelector(sel);

  const els = {
    screenHome: $("#screenHome"),
    screenChat: $("#screenChat"),
    homeDate: $("#homeDate"),
    alertList: $("#alertList"),
    catList: $("#catList"),
    btnOpenChat: $("#btnOpenChat"),
    btnBackHome: $("#btnBackHome"),
    chatScroll: $("#chatScroll"),
    chatStatus: $("#chatStatus"),
    composer: $("#composer"),
    chatInput: $("#chatInput"),
    btnAttach: $("#btnAttach"),
    fileInput: $("#fileInput"),
    btnPlay: $("#btnPlay"),
    playOverlay: $("#playOverlay"),
    playOverlayText: $("#playOverlayText"),
    authSheet: $("#authSheet"),
    authTitle: $("#authTitle"),
    authDetail: $("#authDetail"),
    authAllow: $("#authAllow"),
    authDeny: $("#authDeny")
  };

  let playing = false;
  let playToken = 0;
  let authResolver = null;

  const agoraHora = () =>
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function showHome() {
    stopPlay(false);
    els.screenHome.hidden = false;
    els.screenChat.hidden = true;
  }

  function showChat() {
    els.screenHome.hidden = true;
    els.screenChat.hidden = false;
    if (!els.chatScroll.children.length) {
      appendMarta(
        "Bom dia! Aqui está o resumo do seu negócio hoje.\nSe precisar dos números, volte à página inicial — ou só me peça no chat."
      );
    }
    els.chatInput.focus();
  }

  function renderHome() {
    const now = new Date();
    els.homeDate.textContent = now.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit"
    });

    els.alertList.innerHTML = (D.avisos || [])
      .map(
        (a) => `
      <article class="alert-card ${a.tom === "amber" ? "amber" : ""}">
        <strong>${escapeHtml(a.titulo)}</strong>
        <p>${escapeHtml(a.texto)}</p>
      </article>`
      )
      .join("");

    els.catList.innerHTML = (D.categorias || [])
      .map(
        (c) => `
      <article class="cat-card">
        <div class="cat-head">
          <span class="cat-dot ${escapeHtml(c.tom)}"></span>
          <strong>${escapeHtml(c.nome)}</strong>
        </div>
        <ul>
          ${c.itens.map((i) => `<li>${escapeHtml(i)}</li>`).join("")}
        </ul>
      </article>`
      )
      .join("");
  }

  function scrollChat() {
    requestAnimationFrame(() => {
      els.chatScroll.scrollTop = els.chatScroll.scrollHeight;
    });
  }

  function appendBubble(role, text, hora) {
    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.innerHTML = `
      <div class="msg-bubble">${escapeHtml(text)}<span class="msg-time">${hora || agoraHora()}</span></div>
    `;
    els.chatScroll.appendChild(div);
    scrollChat();
    return div;
  }

  function appendMarta(text) {
    return appendBubble("marta", text);
  }

  function appendUser(text) {
    return appendBubble("user", text);
  }

  function appendFile(name) {
    const div = document.createElement("div");
    div.className = "msg-file";
    div.innerHTML = `
      <span class="msg-file-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>
      </span>
      <div>
        <strong>${escapeHtml(name)}</strong>
        <span>Documento · pronto para enviar</span>
      </div>
    `;
    els.chatScroll.appendChild(div);
    scrollChat();
  }

  function clearChat() {
    els.chatScroll.innerHTML = "";
  }

  function showOverlay(text) {
    if (!text) {
      hideOverlay();
      return;
    }
    els.playOverlay.hidden = false;
    els.playOverlay.classList.remove("fade-out");
    els.playOverlayText.textContent = text;
  }

  function hideOverlay() {
    els.playOverlay.hidden = true;
    els.playOverlayText.textContent = "";
  }

  function sleep(ms, token) {
    return new Promise((resolve) => {
      const t = setTimeout(() => resolve(true), ms);
      const check = setInterval(() => {
        if (token !== playToken) {
          clearTimeout(t);
          clearInterval(check);
          resolve(false);
        }
      }, 80);
      setTimeout(() => clearInterval(check), ms + 100);
    });
  }

  function openAuth(title, detail) {
    return new Promise((resolve) => {
      authResolver = resolve;
      els.authTitle.textContent = title;
      els.authDetail.textContent = detail;
      els.authSheet.hidden = false;
    });
  }

  function closeAuth(ok) {
    els.authSheet.hidden = true;
    if (authResolver) {
      const r = authResolver;
      authResolver = null;
      r(ok);
    }
  }

  async function runPlay() {
    const token = ++playToken;
    playing = true;
    els.btnPlay.setAttribute("aria-pressed", "true");
    els.chatStatus.textContent = "demonstração…";
    clearChat();

    const script = D.playScript || [];
    for (const step of script) {
      if (token !== playToken) return;

      if (step.overlay) showOverlay(step.overlay);
      else hideOverlay();

      if (step.action === "clear") {
        clearChat();
      } else if (step.action === "marta") {
        appendMarta(step.text);
      } else if (step.action === "user") {
        appendUser(step.text);
      } else if (step.action === "upload") {
        appendFile(step.name || "arquivo.xlsx");
      } else if (step.action === "auth") {
        // Mostra o pedido de autorização e autoriza sozinho (demo investidor)
        const authPromise = openAuth(step.title, step.detail);
        await sleep(Math.min(step.wait || 1800, 1600), token);
        if (token !== playToken) return;
        closeAuth(true);
        await authPromise;
        if (token !== playToken) return;
        continue;
      } else if (step.action === "end") {
        /* final overlay only */
      }

      const cont = await sleep(step.wait || 1800, token);
      if (!cont) return;
    }

    stopPlay(true);
  }

  function stopPlay(finished) {
    playToken += 1;
    playing = false;
    els.btnPlay.setAttribute("aria-pressed", "false");
    els.chatStatus.textContent = "online";
    hideOverlay();
    closeAuth(false);
    if (finished) {
      /* keep messages for investor to scroll */
    }
  }

  function handleUserSend(text) {
    const t = String(text || "").trim();
    if (!t || playing) return;
    appendUser(t);
    els.chatInput.value = "";

    const lower = t.toLowerCase();
    setTimeout(() => {
      if (playing) return;
      if (lower.includes("cliente") || lower.includes("campanha")) {
        appendMarta(
          "Posso montar uma lista de leads quentes e um rascunho de campanha. Quer que eu prepare?"
        );
      } else if (lower.includes("estoque") || lower.includes("eletrodo")) {
        appendMarta(
          "Eletrodos E7018 estão em 18% do mínimo. Sugiro Soldamax, 300 kg, entrega em 24h. Autorizo o pedido?"
        );
      } else if (lower.includes("onde") && lower.includes("envi")) {
        appendMarta(
          "Pode mandar o arquivo aqui no chat — eu organizo na pasta certa depois da sua autorização."
        );
      } else {
        appendMarta(
          "Entendi. Antes de qualquer ação no sistema, eu peço sua autorização. O que prefere fazer primeiro?"
        );
      }
    }, 700);
  }

  function bind() {
    els.btnOpenChat.addEventListener("click", showChat);
    els.btnBackHome.addEventListener("click", showHome);

    els.btnPlay.addEventListener("click", () => {
      if (playing) stopPlay(false);
      else runPlay();
    });

    els.composer.addEventListener("submit", (e) => {
      e.preventDefault();
      handleUserSend(els.chatInput.value);
    });

    els.btnAttach.addEventListener("click", () => {
      if (playing) return;
      els.fileInput.click();
    });

    els.fileInput.addEventListener("change", () => {
      const file = els.fileInput.files?.[0];
      if (!file || playing) return;
      appendFile(file.name);
      els.fileInput.value = "";
      setTimeout(() => {
        if (playing) return;
        appendMarta(
          `Recebi “${file.name}”. Quer que eu classifique em Documentos / Campanhas? Preciso da sua autorização.`
        );
      }, 600);
    });

    els.authAllow.addEventListener("click", () => closeAuth(true));
    els.authDeny.addEventListener("click", () => closeAuth(false));
    els.authSheet.addEventListener("click", (e) => {
      if (e.target === els.authSheet) closeAuth(false);
    });
  }

  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("./sw.js?v=20").catch(() => {});
  }

  function init() {
    renderHome();
    bind();
    registerSW();
    showHome();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
