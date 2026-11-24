(() => {
  const D = window.DONA_MARTA_DATA;
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const els = {
    chatScroll: $("#chatScroll"),
    sugestoes: $("#sugestoes"),
    composer: $("#composer"),
    chatInput: $("#chatInput"),
    chatStage: $("#chatStage"),
    btnMic: $("#btnMic"),
    voiceBadge: $("#voiceBadge"),
    btnVoiceToggle: $("#btnVoiceToggle"),
    waveform: $("#waveform"),
    statusLine: $("#statusLine"),
    avatarStage: $("#avatarStage"),
    panelTitle: $("#panelTitle"),
    panelSub: $("#panelSub"),
    toast: $("#toast"),
    authOverlay: $("#authOverlay"),
    authTitle: $("#authTitle"),
    authDetail: $("#authDetail"),
    authAllow: $("#authAllow"),
    authDeny: $("#authDeny"),
    authVoiceYes: $("#authVoiceYes"),
    authVoiceNo: $("#authVoiceNo"),
    authVoiceHint: $("#authVoiceHint"),
    hubSubnav: $("#hubSubnav"),
    notifDrawer: $("#notifDrawer"),
    drawerBackdrop: $("#drawerBackdrop"),
    drawerList: $("#drawerList"),
    drawerSub: $("#drawerSub"),
    notifBadge: $("#notifBadge"),
    drawerClose: $("#drawerClose"),
    drawerMarkAll: $("#drawerMarkAll")
  };

  const HUBS = {
    operacao: {
      label: "Operação",
      default: "producao",
      tabs: [
        { id: "producao", label: "Produção" },
        { id: "estoque", label: "Estoque" },
        { id: "compras", label: "Compras" },
        { id: "financeiro", label: "Financeiro" },
        { id: "agenda", label: "Agenda" },
        { id: "alertas", label: "Alertas" },
        { id: "equipe", label: "Equipe" }
      ]
    },
    clientes: {
      label: "Clientes",
      default: "compras",
      tabs: [
        { id: "compras", label: "Busca & pedidos" },
        { id: "mensagens", label: "Mensagens" }
      ]
    },
    marketing: {
      label: "Marketing",
      default: "marketing",
      tabs: [{ id: "marketing", label: "Campanhas" }]
    },
    relatorios: {
      label: "Relatórios",
      default: "relatorios",
      tabs: [{ id: "relatorios", label: "Indicadores" }]
    },
    pessoal: {
      label: "Pessoal",
      default: "pessoal",
      tabs: [
        { id: "pessoal", label: "RH" },
        { id: "equipe", label: "Equipe" }
      ]
    }
  };

  const TAB_TO_HUB = {};
  Object.entries(HUBS).forEach(([hub, cfg]) => {
    cfg.tabs.forEach((t) => {
      if (!TAB_TO_HUB[t.id]) TAB_TO_HUB[t.id] = hub;
    });
  });

  let voiceOn = true;
  let speaking = false;
  let listening = false;
  let authResolver = null;
  let authListening = false;
  let notifTimer = null;
  let activeHub = null;
  let drawerOpen = false;
  let currentModule = "inicio";

  const PROMPT_EXAMPLES = [
    "Dona Marta, lance as notas de ontem",
    "O estoque de parafuso 5mm está acabando, o que eu faço?",
    "Como foram as vendas do mês?",
    "Me ache novos clientes para esse produto",
    "Manda mensagem no WhatsApp para a metalúrgica X pedindo preço e prazo"
  ];

  const MODULE_PROMPTS = {
    inicio: PROMPT_EXAMPLES,
    estoque: [
      "O estoque de parafuso 5mm está acabando, o que eu faço?",
      "Quais itens estão críticos hoje?",
      "Monte um pedido de reposição de eletrodos"
    ],
    financeiro: [
      "Dona Marta, lance as notas de ontem",
      "Quais NFs vencem hoje?",
      "Agende o pagamento da MetalSul"
    ],
    compras: [
      "Me ache novos clientes para esse produto",
      "Pesquisar fornecedor de aço em Guarulhos",
      "Compare cotações de bobina SAE 1020"
    ],
    mensagens: [
      "Manda mensagem no WhatsApp para a metalúrgica X pedindo preço e prazo",
      "Responda o João da Aço Norte",
      "Prepare um e-mail de cobrança amigável"
    ],
    relatorios: [
      "Como foram as vendas do mês?",
      "Mostre o OEE da semana",
      "Qual cliente mais faturou?"
    ],
    marketing: [
      "Sugira uma campanha LinkedIn para o Q4",
      "Quais leads estão quentes?",
      "Aprove o print da campanha"
    ],
    pessoal: [
      "Quem pediu adiantamento esta semana?",
      "Quais férias estão pendentes?",
      "Resumo do banco de horas"
    ],
    treinamento: [
      "Quem está pendente na NR-12?",
      "Confirme a turma de solda MIG",
      "Agenda de treinamentos da semana"
    ],
    producao: [
      "Como está a produção agora?",
      "Status da linha 3",
      "Quando o laser volta?"
    ],
    agenda: ["Qual a próxima reunião?", "Resumo da agenda de hoje"],
    alertas: ["Alertas urgentes", "Priorize o estoque crítico"],
    equipe: ["Quem faltou hoje?", "Como está a cobertura da solda?"]
  };
  let msgCanal = "whatsapp";
  let waAtivo = D.mensagens.whatsapp[0]?.id || null;
  let comprasPane = "busca";
  let serperTipo = "fornecedor";
  let serperQuery = "";
  let serperResults = [];
  let serperBusy = false;
  let serperDidSearch = false;

  const money = (n) => {
    const v = Number(n);
    if (!Number.isFinite(v)) return "R$ —";
    return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  };

  const agoraHora = () =>
    new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  function showToast(text, ms = 2400) {
    els.toast.textContent = text;
    els.toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => els.toast.classList.remove("show"), ms);
  }

  function atualizarBadgeNotif() {
    const unread = (D.notificacoes || []).filter((n) => !n.lida).length;
    if (!els.notifBadge) return;
    if (unread > 0) {
      els.notifBadge.hidden = false;
      els.notifBadge.textContent = String(unread > 9 ? "9+" : unread);
    } else {
      els.notifBadge.hidden = true;
    }
    if (els.drawerSub) {
      els.drawerSub.textContent =
        unread > 0 ? `${unread} não lidas` : "Tudo em dia";
    }
  }

  function abrirGaveta() {
    drawerOpen = true;
    renderDrawer();
    if (els.notifDrawer) {
      els.notifDrawer.classList.add("open");
      els.notifDrawer.setAttribute("aria-hidden", "false");
    }
    if (els.drawerBackdrop) els.drawerBackdrop.hidden = false;
  }

  function fecharGaveta() {
    drawerOpen = false;
    if (els.notifDrawer) {
      els.notifDrawer.classList.remove("open");
      els.notifDrawer.setAttribute("aria-hidden", "true");
    }
    if (els.drawerBackdrop) els.drawerBackdrop.hidden = true;
  }

  function renderDrawer() {
    if (!els.drawerList) return;
    const list = D.notificacoes || [];
    if (!list.length) {
      els.drawerList.innerHTML = `<p class="muted" style="padding:20px 8px;text-align:center">Nenhuma notificação por enquanto.</p>`;
      atualizarBadgeNotif();
      return;
    }
    els.drawerList.innerHTML = list
      .map(
        (n) => `
      <article class="drawer-item ${n.lida ? "" : "unread"}" data-id="${escapeHtml(n.id)}">
        <div class="drawer-item-type">${escapeHtml(n.tipo)}</div>
        <strong>${escapeHtml(n.titulo)}</strong>
        <p>${escapeHtml(n.detalhe)}</p>
        <div class="drawer-item-foot">
          <span class="hora">${escapeHtml(n.hora || "")}</span>
          <button type="button" class="btn-primary drawer-action" data-id="${escapeHtml(n.id)}">${escapeHtml(n.acao || "Ver")}</button>
        </div>
      </article>`
      )
      .join("");

    els.drawerList.querySelectorAll(".drawer-action").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const n = D.notificacoes.find((x) => x.id === btn.dataset.id);
        if (!n) return;
        await acaoComAuth({
          titulo: n.acao,
          detalhe: `${n.titulo} — ${n.detalhe}`,
          sucesso: `“${n.acao}” autorizado.`,
          onOk: () => {
            n.lida = true;
            const tabJump = {
              WhatsApp: "mensagens",
              Estoque: "estoque",
              Produção: "producao",
              Financeiro: "financeiro",
              RH: "pessoal",
              Marketing: "marketing",
              Treinamento: "treinamento",
              Compras: "compras"
            };
            const dest = tabJump[n.tipo];
            if (dest) switchTab(dest);
          }
        });
        renderDrawer();
        atualizarBadgeNotif();
      });
    });
    atualizarBadgeNotif();
  }

  function pushNotifCard({ titulo, detalhe, tipo = "Aviso", acaoLabel = "Ver", onAction, silent = false }) {
    const id = `live-${Date.now()}`;
    D.notificacoes.unshift({
      id,
      tipo,
      titulo,
      detalhe,
      acao: acaoLabel,
      hora: agoraHora(),
      lida: false,
      _onAction: onAction || null
    });
    atualizarBadgeNotif();
    if (drawerOpen) renderDrawer();
    if (!silent && voiceOn && !speaking && !authResolver) {
      speak(`Nova notificação: ${titulo}. Abra a gaveta de avisos para ver.`);
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function delay(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }

  /* —— Auth gate (voz + botão) —— */
  function pedirAutorizacao({ titulo, detalhe, fala }) {
    return new Promise((resolve) => {
      authResolver = resolve;
      authListening = false;
      els.authTitle.textContent = titulo;
      els.authDetail.textContent = detalhe;
      if (els.authVoiceHint) {
        els.authVoiceHint.textContent =
          "Modo voz: diga “sim, autorizo” ou “agora não” — ou use os botões abaixo.";
      }
      els.authOverlay.hidden = false;

      const pergunta =
        fala ||
        `Posso ${titulo.toLowerCase()}? Preciso da sua confirmação por voz ou pelo botão Autorizar.`;
      speak(pergunta).then(() => {
        if (authResolver && voiceOn) simularEscutaAuth();
      });
    });
  }

  async function simularEscutaAuth() {
    if (!authResolver || authListening) return;
    authListening = true;
    setVoiceUI("listening");
    if (els.authVoiceHint) {
      els.authVoiceHint.textContent = "Ouvindo confirmação… (simulado)";
    }
    await delay(1600);
    authListening = false;
    if (!authResolver) return;
    setVoiceUI("idle");
    if (els.authVoiceHint) {
      els.authVoiceHint.textContent =
        "Ainda aguardando: diga “Sim, autorizo” / “Agora não”, ou toque nos botões.";
    }
  }

  async function confirmarPorVoz(ok) {
    if (!authResolver) return;
    authListening = true;
    setVoiceUI("listening");
    showToast(ok ? "Voz: “Sim, autorizo”" : "Voz: “Agora não”");
    await delay(700);
    authListening = false;
    fecharAuth(ok);
  }

  function fecharAuth(ok) {
    els.authOverlay.hidden = true;
    authListening = false;
    const r = authResolver;
    authResolver = null;
    setVoiceUI("idle");
    if (r) r(ok);
  }

  async function acaoComAuth({ titulo, detalhe, sucesso, fala, onOk }) {
    const ok = await pedirAutorizacao({ titulo, detalhe, fala });
    if (!ok) {
      showToast("Ok — não fiz nada.");
      pushNotifCard({
        titulo: "Ação cancelada",
        detalhe: titulo,
        tipo: "Voz",
        acaoLabel: "Entendi",
        onAction: async () => showToast("Ciente.")
      });
      await speak("Tudo bem. Não executei nenhuma ação.");
      return false;
    }
    if (onOk) onOk();
    showToast(sucesso || "Ação autorizada e simulada.");
    pushNotifCard({
      titulo: "Ação autorizada",
      detalhe: sucesso || titulo,
      tipo: "OK",
      acaoLabel: "Ver avisos",
      onAction: async () => abrirGaveta()
    });
    await speak(sucesso || "Pronto. Ação autorizada.");
    return true;
  }

  function syncVoiceControls() {
    const badgeLabel = $("#voiceBadgeLabel");
    els.voiceBadge.classList.toggle("off", !voiceOn);
    if (badgeLabel) badgeLabel.textContent = voiceOn ? "Voz ON" : "Voz OFF";

    if (els.btnVoiceToggle) {
      els.btnVoiceToggle.setAttribute("aria-pressed", voiceOn ? "true" : "false");
      els.btnVoiceToggle.textContent = voiceOn ? "Desligar voz" : "Ligar voz";
      els.btnVoiceToggle.title = voiceOn
        ? "Desligar o modo voz da Dona Marta"
        : "Ligar o modo voz da Dona Marta";
    }

    if (els.btnMic) {
      els.btnMic.classList.toggle("active", voiceOn);
      els.btnMic.setAttribute("aria-pressed", voiceOn ? "true" : "false");
    }
  }

  function setVoiceUI(mode) {
    els.voiceBadge.classList.remove("speaking", "listening");
    els.waveform.classList.toggle("active", mode === "speaking" || mode === "listening");
    els.avatarStage.classList.toggle("speaking", mode === "speaking");
    const badgeLabel = $("#voiceBadgeLabel");

    if (mode === "speaking" && voiceOn) {
      els.voiceBadge.classList.add("speaking");
      els.voiceBadge.classList.remove("off");
      els.statusLine.textContent = "Falando o resumo / resposta…";
      if (badgeLabel) badgeLabel.textContent = "Falando";
      if (els.btnVoiceToggle) els.btnVoiceToggle.textContent = "Desligar voz";
    } else if (mode === "listening" && voiceOn) {
      els.voiceBadge.classList.add("listening");
      els.voiceBadge.classList.remove("off");
      els.statusLine.textContent = "Ouvindo confirmação… (simulado)";
      if (badgeLabel) badgeLabel.textContent = "Ouvindo";
      if (els.btnVoiceToggle) els.btnVoiceToggle.textContent = "Desligar voz";
    } else if (voiceOn) {
      els.voiceBadge.classList.remove("off");
      els.statusLine.textContent = "Modo voz ativo · pronta para ouvir";
      if (badgeLabel) badgeLabel.textContent = "Voz ON";
      if (els.btnVoiceToggle) {
        els.btnVoiceToggle.textContent = "Desligar voz";
        els.btnVoiceToggle.setAttribute("aria-pressed", "true");
      }
    } else {
      els.voiceBadge.classList.add("off");
      els.statusLine.textContent = "Modo voz desligado";
      els.waveform.classList.remove("active");
      els.avatarStage.classList.remove("speaking");
      if (badgeLabel) badgeLabel.textContent = "Voz OFF";
      if (els.btnVoiceToggle) {
        els.btnVoiceToggle.textContent = "Ligar voz";
        els.btnVoiceToggle.setAttribute("aria-pressed", "false");
      }
    }
  }

  function pararFala() {
    window.speechSynthesis?.cancel();
    speaking = false;
    listening = false;
    authListening = false;
    clearTimeout(speak._fallback);
  }

  function setVoiceMode(on, { announce = true, autoListen = false } = {}) {
    voiceOn = !!on;
    if (!voiceOn) {
      pararFala();
      setVoiceUI("idle");
      syncVoiceControls();
      if (announce) showToast("Modo voz desligado — Dona Marta parou de falar");
      return;
    }
    syncVoiceControls();
    setVoiceUI("idle");
    if (announce) showToast("Modo voz ligado");
    if (autoListen) simulateListen();
  }

  function speak(text, { force = false } = {}) {
    return new Promise((resolve) => {
      if (!voiceOn && !force) {
        resolve();
        return;
      }

      speaking = true;
      setVoiceUI("speaking");

      const finish = () => {
        speaking = false;
        if (!voiceOn) setVoiceUI("idle");
        else if (listening) setVoiceUI("listening");
        else setVoiceUI("idle");
        resolve();
      };

      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.lang = "pt-BR";
        u.rate = 1.04;
        u.pitch = 1.05;

        const pickVoice = () => {
          const voices = window.speechSynthesis.getVoices();
          const pt =
            voices.find((v) => /pt-BR/i.test(v.lang) && /female|maria|luciana|fernanda|google/i.test(v.name)) ||
            voices.find((v) => /pt-BR/i.test(v.lang)) ||
            voices.find((v) => /^pt/i.test(v.lang));
          if (pt) u.voice = pt;
        };
        pickVoice();

        u.onend = finish;
        u.onerror = finish;
        window.speechSynthesis.speak(u);

        const approx = Math.min(20000, Math.max(2200, text.length * 52));
        clearTimeout(speak._fallback);
        speak._fallback = setTimeout(() => {
          if (speaking) {
            window.speechSynthesis.cancel();
            finish();
          }
        }, approx);

        // Se o usuário desligar a voz no meio da fala, encerra
        const watch = setInterval(() => {
          if (!voiceOn && speaking) {
            clearInterval(watch);
            window.speechSynthesis.cancel();
            finish();
          }
          if (!speaking) clearInterval(watch);
        }, 200);
      } else {
        const approx = Math.min(10000, Math.max(2000, text.length * 35));
        const t0 = Date.now();
        const watch = setInterval(() => {
          if (!voiceOn || Date.now() - t0 >= approx) {
            clearInterval(watch);
            finish();
          }
        }, 200);
      }
    });
  }

  function appendMessage({ role, html, chips, hora }) {
    const wrap = document.createElement("article");
    wrap.className = `msg ${role}`;
    wrap.innerHTML = `
      <div class="msg-meta">
        <span>${role === "marta" ? "Dona Marta" : "Você"}</span>
        <span>${hora || agoraHora()}</span>
      </div>
      <div class="msg-bubble">${html}</div>
    `;

    if (chips?.length) {
      const row = document.createElement("div");
      row.className = "msg-chips";
      chips.forEach((c) => {
        const b = document.createElement("button");
        b.type = "button";
        b.textContent = c;
        b.addEventListener("click", () => {
          if (/aviso|notif/i.test(c)) {
            abrirGaveta();
            return;
          }
          sendUserText(c);
        });
        row.appendChild(b);
      });
      wrap.querySelector(".msg-bubble").appendChild(row);
    }

    els.chatScroll.appendChild(wrap);
    els.chatScroll.scrollTop = els.chatScroll.scrollHeight;
    return wrap;
  }

  function metricaIcon(kind) {
    const icons = {
      money:
        '<svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.65 1.87 1.96 0 2.4-.98 2.4-1.59 0-.83-.44-1.61-2.67-2.14-2.48-.6-4.18-1.62-4.18-3.67 0-1.72 1.39-2.84 3.11-3.21V4h2.67v1.95c1.86.45 2.79 1.86 2.85 3.39H14.3c-.05-1.11-.64-1.87-2.22-1.87-1.5 0-2.4.68-2.4 1.64 0 .84.65 1.39 2.67 1.91s4.18 1.39 4.18 3.91c-.01 1.83-1.38 2.83-3.12 3.16z"/></svg>',
      bag: '<svg viewBox="0 0 24 24"><path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2h2V8h4v2h2V8h2v12z"/></svg>',
      warn: '<svg viewBox="0 0 24 24"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>',
      doc: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/></svg>'
    };
    return icons[kind] || icons.doc;
  }

  function resumoHtml() {
    const r = D.resumoDia;
    const metrics = (r.metricas || [])
      .map(
        (m) => `
      <button type="button" class="metric-row tone-${escapeHtml(m.tom)}" data-tab-jump="${escapeHtml(m.tab)}">
        <span class="metric-icon" aria-hidden="true">${metricaIcon(m.icon)}</span>
        <span class="metric-body">
          <span class="metric-title">${escapeHtml(m.titulo)}</span>
          <strong class="metric-value">${escapeHtml(m.valor)}</strong>
          <span class="metric-sub">${escapeHtml(m.sub)}</span>
        </span>
        <span class="metric-chev" aria-hidden="true">›</span>
      </button>`
      )
      .join("");
    return `
      <div class="resumo-card">
        <p class="resumo-hello">👋 <strong>${escapeHtml(r.saudacao)}</strong> ${escapeHtml(r.intro)}</p>
        <div class="metric-list">${metrics}</div>
      </div>
    `;
  }

  function extractSerperQuery(text) {
    const t = text.trim();
    const patterns = [
      /(?:pesquisar|pesquisa|buscar|busca|procure|encontrar)\s+(?:um\s+|uma\s+)?(?:fornecedor|cliente)s?\s+(?:de\s+|sobre\s+|chamad[oa]\s+|)?(.+)/i,
      /(?:fornecedor|cliente)s?\s+(?:de\s+|sobre\s+)?(.+)/i,
      /serper\s+(.+)/i
    ];
    for (const p of patterns) {
      const m = t.match(p);
      if (m?.[1]) return m[1].replace(/[?!.,]+$/, "").trim();
    }
    return t
      .replace(/^(pesquisar|pesquisa|buscar|busca|procure|encontrar|serper)\s+/i, "")
      .replace(/^(um|uma|o|a|de|do|da|sobre)\s+/i, "")
      .replace(/^(fornecedor|cliente)s?\s+/i, "")
      .trim();
  }

  function matchIntent(text) {
    const t = text.toLowerCase();
    if (/pesquis|busc|procur|serper|encontrar/.test(t) && /fornecedor|cliente|empresa|aço|aco|eletrodo|epi|construtor|industria|indústria/.test(t))
      return "serper";
    if (/pesquis|busc|serper/.test(t) && /(fornecedor|cliente)/.test(t)) return "serper";
    if (/whats|mensagem|e-?mail|inbox/.test(t)) return "mensagens";
    if (/estoq|sku|almox/.test(t)) return "estoque";
    if (/cliente/.test(t) && !/falta|equipe/.test(t)) return "serper-cliente";
    if (/compra|cotaç|cotac|fornecedor|sc-/.test(t)) return "compras";
    if (/relat|gráfico|grafico|indicador/.test(t)) return "relatorios";
    if (/market|print|campanha|linkedin/.test(t)) return "marketing";
    if (/pessoal|rh|férias|ferias|adiant/.test(t)) return "pessoal";
    if (/trein|nr-?12|curso/.test(t)) return "treinamento";
    if (/notif|aviso/.test(t)) return "notificacoes";
    if (/produ|oee|peça|peca|linha|op-/.test(t)) return "producao";
    if (/reuni|agenda|próxim|proxim/.test(t)) return "reuniao";
    if (/falt|ausên|ausen|equipe|quem/.test(t)) return "faltas";
    if (/alerta|urgente|compressor/.test(t)) return "alertas";
    if (/financ|nota|nf|pagar|caixa|receb/.test(t)) return "financeiro";
    if (/linha\s*3|solda/.test(t)) return "linha3";
    if (/resumo|bom dia|dia/.test(t)) return "resumo";
    return "default";
  }

  function stripAccents(s) {
    return String(s)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function scoreSerperItem(item, query) {
    const q = stripAccents(query);
    const tokens = q.split(/\s+/).filter(Boolean);
    const blob = stripAccents(`${item.nome} ${item.snippet} ${(item.tags || []).join(" ")} ${item.endereco}`);
    let score = 0;
    tokens.forEach((tok) => {
      if (blob.includes(tok)) score += 3;
      if (item.nome.toLowerCase().includes(tok)) score += 4;
      if ((item.tags || []).some((tg) => tg.includes(tok) || tok.includes(tg))) score += 2;
    });
    if (!tokens.length) score = 1;
    return score;
  }

  function runSerperSearch(query, tipo) {
    const pool = D.buscaSerper[tipo] || [];
    const q = (query || "").trim();
    let ranked = pool
      .map((item) => ({ item, score: scoreSerperItem(item, q || tipo) }))
      .filter((x) => (q ? x.score > 0 : true))
      .sort((a, b) => b.score - a.score)
      .map((x) => x.item);
    if (!ranked.length) ranked = pool.slice(0, 4);
    return ranked.slice(0, 5);
  }

  async function executarBuscaSerper(query, tipo, { fromChat = false } = {}) {
    comprasPane = "busca";
    serperTipo = tipo;
    serperQuery = query;
    serperBusy = true;
    serperDidSearch = true;
    serperResults = [];
    switchTab("compras");
    renderCompras();
    await delay(900 + Math.random() * 500);
    serperResults = runSerperSearch(query, tipo);
    serperBusy = false;
    renderCompras();
    if (fromChat) {
      const n = serperResults.length;
      const label = tipo === "cliente" ? "clientes" : "fornecedores";
      appendMessage({
        role: "marta",
        html: `<p>Busca Serper <em>simulada</em> por <strong>${escapeHtml(query)}</strong>: encontrei <strong>${n} ${label}</strong>. Abri a aba Compras &amp; Clientes com telefone, site, redes e WhatsApp.</p>`,
        chips: ["Pesquisar outro fornecedor", "Buscar cliente construtora", "Ver pedidos de compra"]
      });
      await speak(`Encontrei ${n} ${label} na busca simulada. Os resultados estão na aba de compras.`);
    }
  }

  async function replyTo(text) {
    const key = matchIntent(text);

    if (key === "serper" || key === "serper-cliente") {
      const tipo =
        key === "serper-cliente" || /cliente/i.test(text)
          ? "cliente"
          : /fornecedor|aço|aco|eletrodo|epi|gás|gas|laser/i.test(text)
            ? "fornecedor"
            : /cliente|construtor|industria|indústria|obra|galp/i.test(text)
              ? "cliente"
              : serperTipo;
      const q = extractSerperQuery(text) || (tipo === "cliente" ? "construtora estruturas SP" : "aço bobina Guarulhos");
      await executarBuscaSerper(q, tipo, { fromChat: true });
      return;
    }

    if (key === "notificacoes") {
      abrirGaveta();
      appendMessage({
        role: "marta",
        html: `<p>Abri a gaveta de <strong>avisos</strong>. Toque em um item para agir — eu peço autorização antes.</p>`,
        chips: ["Estoque", "Como está a produção?", "Próxima reunião"]
      });
      await speak("Abri a gaveta de avisos.");
      return;
    }

    const tabMap = {
      mensagens: "mensagens",
      estoque: "estoque",
      compras: "compras",
      relatorios: "relatorios",
      marketing: "marketing",
      pessoal: "pessoal",
      treinamento: "treinamento"
    };

    if (tabMap[key]) {
      if (key === "compras") {
        comprasPane = "pedidos";
        renderCompras();
      }
      appendMessage({
        role: "marta",
        html: `<p>Claro — abri <strong>${tabMap[key]}</strong> com os dados de hoje. Em qualquer ação eu peço sua autorização antes.</p>`,
        chips: ["Pesquisar fornecedor de aço", "Buscar cliente construtora", "Alertas urgentes"]
      });
      switchTab(tabMap[key]);
      await speak(`Abri ${tabMap[key]}. Em qualquer ação eu peço sua autorização antes.`);
      return;
    }

    let payload;
    if (key === "resumo") {
      payload = {
        texto: [D.resumoDia.saudacao, D.resumoDia.intro, ...D.resumoDia.pontos].join(" "),
        html: resumoHtml(),
        chips: ["Como está a produção?", "Mensagens", "Estoque"]
      };
    } else {
      const r = D.respostasSimuladas[key] || D.respostasSimuladas.default;
      payload = { texto: r.texto, html: `<p>${r.texto}</p>`, chips: r.chips };
    }

    appendMessage({ role: "marta", html: payload.html, chips: payload.chips });
    await speak(payload.texto);
  }

  async function sendUserText(text) {
    const clean = text.trim();
    if (!clean) return;
    appendMessage({ role: "user", html: `<p>${escapeHtml(clean)}</p>` });
    els.chatInput.value = "";
    await delay(300);
    await replyTo(clean);
  }

  function btnAuth(label, attrs = "") {
    return `<button type="button" class="btn-action" data-auth ${attrs}>${escapeHtml(label)}</button>`;
  }

  function bindAuthButtons(root, builders) {
    root.querySelectorAll("[data-auth]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const kind = btn.getAttribute("data-kind");
        const cfg = builders({ id, kind, btn });
        if (!cfg) return;
        await acaoComAuth(cfg);
        if (cfg.rerender) cfg.rerender();
      });
    });
  }

  /* —— Existing tabs —— */
  function renderAgenda() {
    $("#view-agenda").innerHTML = `
      <div class="tab-scroll">
        <div>
          <h2 class="section-title">Hoje na Metalúrgica Almeida</h2>
          <p class="muted">${D.empresa.dataRef} · ${D.empresa.unidade}</p>
        </div>
        ${D.agenda
          .map(
            (a) => `
          <article class="list-item">
            <div class="hora">${a.hora}</div>
            <div>
              <h3>${a.titulo}</h3>
              <p>${a.local} · ${a.detalhe}</p>
              <div class="row-actions">${btnAuth("Preparar pauta", `data-kind="agenda" data-id="${a.hora}"`)}</div>
            </div>
            <div class="tag">${a.tipo}<br>${a.status}</div>
          </article>`
          )
          .join("")}
      </div>`;
    bindAuthButtons($("#view-agenda"), ({ id }) => {
      const a = D.agenda.find((x) => x.hora === id);
      return {
        titulo: `Preparar pauta das ${a.hora}`,
        detalhe: `Vou montar os pontos da reunião “${a.titulo}” e enviar ao seu e-mail interno (simulado).`,
        sucesso: `Pauta das ${a.hora} preparada e enviada no fluxo simulado.`
      };
    });
  }

  function renderProducao() {
    const p = D.producao;
    $("#view-producao").innerHTML = `
      <div class="tab-scroll">
        <div class="stat-row">
          <div class="stat"><div class="label">OEE geral</div><div class="value">${p.oeeGeral}%</div></div>
          <div class="stat"><div class="label">Peças / meta</div><div class="value">${p.pecasFeitas}<span style="font-size:.9rem;color:var(--texto-suave)">/${p.metaPecas}</span></div></div>
          <div class="stat"><div class="label">Linhas ativas</div><div class="value">${p.linhas.filter((l) => l.status === "ok").length}</div></div>
        </div>
        <h2 class="section-title">Linhas</h2>
        <div class="linha-grid">
          ${p.linhas
            .map(
              (l) => `
            <article class="linha">
              <div>
                <h3>${l.nome} · OEE ${l.oee}%</h3>
                <p class="muted">${l.detalhes}</p>
                <div class="progress"><i style="width:${l.oee}%"></i></div>
                <div class="row-actions">${btnAuth("Pedir status ao supervisor", `data-kind="linha" data-id="${escapeHtml(l.nome)}"`)}</div>
              </div>
              <span class="status-pill ${l.status}">${l.status === "ok" ? "OK" : l.status === "manut" ? "Manutenção" : "Atenção"}</span>
            </article>`
            )
            .join("")}
        </div>
        <h2 class="section-title">Ordens prioritárias</h2>
        ${p.ops
          .map(
            (op) => `
          <article class="list-item">
            <div class="badge">${op.id}</div>
            <div>
              <h3>${op.cliente}</h3>
              <p>Prioridade ${op.prioridade}</p>
              <div class="progress"><i style="width:${op.progresso}%"></i></div>
              <div class="row-actions">${btnAuth("Priorizar OP", `data-kind="op" data-id="${op.id}"`)}</div>
            </div>
            <div class="tag">${op.progresso}%</div>
          </article>`
          )
          .join("")}
      </div>`;
    bindAuthButtons($("#view-producao"), ({ id, kind }) => {
      if (kind === "linha") {
        return {
          titulo: `Solicitar status de ${id}`,
          detalhe: "Vou notificar o supervisor responsável e trazer o retorno para o chat (simulado).",
          sucesso: `Solicitação enviada ao supervisor de ${id}.`
        };
      }
      return {
        titulo: `Priorizar ${id}`,
        detalhe: `A ordem ${id} sobe na fila da linha e os materiais serão reservados (simulado).`,
        sucesso: `${id} priorizada no fluxo simulado.`
      };
    });
  }

  function renderEquipe() {
    const e = D.equipe;
    $("#view-equipe").innerHTML = `
      <div class="tab-scroll">
        <div class="stat-row">
          <div class="stat"><div class="label">Presentes</div><div class="value">${e.presentes}</div></div>
          <div class="stat"><div class="label">Ausências</div><div class="value">${e.faltas}</div></div>
          <div class="stat"><div class="label">Headcount</div><div class="value">${e.total}</div></div>
        </div>
        <h2 class="section-title">Ausências de hoje</h2>
        ${e.ausencias
          .map(
            (a) => `
          <article class="list-item">
            <div class="badge">—</div>
            <div>
              <h3>${a.nome}</h3>
              <p>${a.cargo} · ${a.motivo} · cobertura ${a.cobertura}</p>
              <div class="row-actions">${btnAuth("Confirmar", `data-kind="cobertura" data-id="${escapeHtml(a.nome)}"`)}</div>
            </div>
            <div class="tag">RH</div>
          </article>`
          )
          .join("")}
        <h2 class="section-title">Por setor</h2>
        ${e.setores
          .map(
            (s) => `
          <article class="list-item">
            <div class="badge">${s.presentes}</div>
            <div><h3>${s.nome}</h3><p>${s.ausentes} ausente(s)</p></div>
            <div class="tag">turno</div>
          </article>`
          )
          .join("")}
      </div>`;
    bindAuthButtons($("#view-equipe"), ({ id }) => ({
      titulo: `Confirmar cobertura de ${id}`,
      detalhe: "Registro da cobertura no quadro do turno e aviso ao RH (simulado).",
      sucesso: `Cobertura de ${id} confirmada.`
    }));
  }

  function nfLabel(item = {}) {
    const raw = item || {};
    const numero = raw.nf || (raw.numero ? `NF ${raw.numero}` : "") || raw.titulo || "NF —";
    const empresa = raw.fornecedor || raw.cliente || raw.empresa || "—";
    const valorNum = Number(raw.valor);
    const valorTxt = Number.isFinite(valorNum) ? money(valorNum) : "R$ —";
    const quando =
      raw.vence || raw.previsao || raw.vencimento || (raw.dias != null ? `${raw.dias}d atraso` : "—");
    const detalhe = raw.descricao || "Documento fiscal Metalúrgica Almeida";
    return { numero, empresa, valorTxt, valorNum: Number.isFinite(valorNum) ? valorNum : 0, quando, detalhe };
  }

  function renderFinanceiro() {
    const f = D.financeiro || { caixaEstimado: 0, saidasHoje: [], entradasHoje: [], atrasos: [] };
    const saidas = f.saidasHoje || [];
    const entradas = f.entradasHoje || [];
    const atrasos = f.atrasos || [];
    const totalSaidas = saidas.reduce((a, x) => a + (Number(x.valor) || 0), 0);
    const totalEntradas = entradas.reduce((a, x) => a + (Number(x.valor) || 0), 0);

    $("#view-financeiro").innerHTML = `
      <div class="tab-scroll">
        <div class="stat-row">
          <div class="stat"><div class="label">Caixa estimado</div><div class="value" style="font-size:1.15rem">${money(f.caixaEstimado || 0)}</div></div>
          <div class="stat"><div class="label">Saídas hoje</div><div class="value" style="font-size:1.15rem">${money(totalSaidas)}</div></div>
          <div class="stat"><div class="label">Entradas hoje</div><div class="value" style="font-size:1.15rem">${money(totalEntradas)}</div></div>
        </div>
        <h2 class="section-title">A pagar</h2>
        ${saidas
          .map((s, i) => {
            const n = nfLabel(s);
            return `
          <article class="list-item nf-card">
            <div class="badge">${escapeHtml(n.quando)}</div>
            <div>
              <h3>${escapeHtml(n.numero)}</h3>
              <p><strong>Fornecedor:</strong> ${escapeHtml(n.empresa)}</p>
              <p><strong>Valor:</strong> ${escapeHtml(n.valorTxt)} · ${escapeHtml(n.detalhe)}</p>
              <div class="row-actions">${btnAuth("Agendar pagamento", `data-kind="pagar" data-id="${i}"`)}</div>
            </div>
            <div class="tag money">${escapeHtml(n.valorTxt)}</div>
          </article>`;
          })
          .join("")}
        <h2 class="section-title">A receber</h2>
        ${entradas
          .map((s, i) => {
            const n = nfLabel(s);
            return `
          <article class="list-item nf-card">
            <div class="badge">${escapeHtml(n.quando)}</div>
            <div>
              <h3>${escapeHtml(n.numero)}</h3>
              <p><strong>Cliente:</strong> ${escapeHtml(n.empresa)}</p>
              <p><strong>Valor:</strong> ${escapeHtml(n.valorTxt)} · ${escapeHtml(n.detalhe)}</p>
            </div>
            <div class="tag money">${escapeHtml(n.valorTxt)}</div>
          </article>`;
          })
          .join("")}
        <h2 class="section-title">Em atraso</h2>
        ${atrasos
          .map((s, i) => {
            const n = nfLabel(s);
            return `
          <article class="list-item nf-card">
            <div class="badge">${escapeHtml(String(s.dias != null ? s.dias + "d" : n.quando))}</div>
            <div>
              <h3>${escapeHtml(n.numero)}</h3>
              <p><strong>Cliente:</strong> ${escapeHtml(n.empresa)}</p>
              <p><strong>Valor:</strong> ${escapeHtml(n.valorTxt)} · ${escapeHtml(n.detalhe)}</p>
              <div class="row-actions">${btnAuth("Enviar cobrança", `data-kind="cobrar" data-id="${i}"`)}</div>
            </div>
            <div class="tag money">${escapeHtml(n.valorTxt)}</div>
          </article>`;
          })
          .join("")}
      </div>`;
    bindAuthButtons($("#view-financeiro"), ({ id, kind }) => {
      if (kind === "pagar") {
        const s = saidas[Number(id)];
        const n = nfLabel(s || {});
        return {
          titulo: `Agendar pagamento de ${n.numero}`,
          detalhe: `${n.empresa} · ${n.valorTxt}. Vou incluir o boleto na fila do banco (simulado).`,
          sucesso: `Pagamento de ${n.numero} (${n.empresa}, ${n.valorTxt}) agendado.`
        };
      }
      const s = atrasos[Number(id)];
      const n = nfLabel(s || {});
      return {
        titulo: `Enviar cobrança de ${n.numero}`,
        detalhe: `${n.empresa} · ${n.valorTxt}. Disparo de e-mail e WhatsApp (simulado).`,
        sucesso: `Cobrança de ${n.numero} enviada a ${n.empresa}.`
      };
    });
  }

  function renderAlertas() {
    $("#view-alertas").innerHTML = `
      <div class="tab-scroll">
        <div>
          <h2 class="section-title">Fila de atenção</h2>
          <p class="muted">Toda ação pede sua autorização</p>
        </div>
        ${D.alertas
          .map(
            (a, i) => `
          <article class="alerta ${a.nivel}">
            <div class="bar" aria-hidden="true"></div>
            <div>
              <h3>${a.titulo}</h3>
              <p>${a.detalhe}</p>
            </div>
            ${btnAuth(a.acao, `data-kind="alerta" data-id="${i}"`)}
          </article>`
          )
          .join("")}
      </div>`;
    bindAuthButtons($("#view-alertas"), ({ id }) => {
      const a = D.alertas[Number(id)];
      return {
        titulo: a.acao,
        detalhe: `${a.titulo}. ${a.detalhe}`,
        sucesso: `Ação “${a.acao}” autorizada e registrada.`
      };
    });
  }

  /* —— Mensagens —— */
  function renderMensagens() {
    const root = $("#view-mensagens");
    const wa = D.mensagens.whatsapp;
    const em = D.mensagens.emails;
    const ativo = wa.find((w) => w.id === waAtivo) || wa[0];

    root.innerHTML = `
      <div class="tab-scroll msg-layout">
        <div class="seg-control" role="tablist">
          <button type="button" class="seg ${msgCanal === "whatsapp" ? "active" : ""}" data-canal="whatsapp">WhatsApp (${wa.filter((w) => w.naoLida).length})</button>
          <button type="button" class="seg ${msgCanal === "email" ? "active" : ""}" data-canal="email">E-mails (${em.filter((e) => e.naoLida).length})</button>
        </div>

        <div class="canal-pane ${msgCanal === "whatsapp" ? "show" : ""}" id="pane-wa">
          <div class="wa-grid">
            <div class="wa-list">
              ${wa
                .map(
                  (c) => `
                <button type="button" class="wa-item ${c.id === ativo.id ? "active" : ""}" data-wa="${c.id}">
                  <strong>${escapeHtml(c.contato)} ${c.naoLida ? '<span class="dot-unread"></span>' : ""}</strong>
                  <span>${escapeHtml(c.preview)}</span>
                  <em>${c.hora}</em>
                </button>`
                )
                .join("")}
            </div>
            <div class="wa-thread">
              <div class="wa-head">
                <div>
                  <h3>${escapeHtml(ativo.contato)}</h3>
                  <p class="muted">${escapeHtml(ativo.telefone)}</p>
                </div>
                ${btnAuth("Enviar resposta sugerida", `data-kind="wa" data-id="${ativo.id}"`)}
              </div>
              <div class="wa-bubbles">
                ${ativo.thread
                  .map(
                    (m) => `
                  <div class="wa-bubble ${m.de === "eles" ? "in" : "out"}">
                    <p>${escapeHtml(m.texto)}</p>
                    <small>${m.hora}</small>
                  </div>`
                  )
                  .join("")}
                <div class="wa-bubble out draft">
                  <p><strong>Sugestão da Dona Marta:</strong> ${escapeHtml(ativo.respostaSugerida)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="canal-pane ${msgCanal === "email" ? "show" : ""}" id="pane-em">
          ${em
            .map(
              (e) => `
            <article class="email-card ${e.naoLida ? "unread" : ""}">
              <div class="email-top">
                <div>
                  <h3>${escapeHtml(e.assunto)} ${e.naoLida ? '<span class="pill-new">Novo</span>' : ""}</h3>
                  <p class="muted">De: ${escapeHtml(e.de)} · ${e.hora}</p>
                </div>
              </div>
              <p>${escapeHtml(e.resumo)}</p>
              <details>
                <summary>Ver corpo completo</summary>
                <pre class="email-body">${escapeHtml(e.corpo)}</pre>
              </details>
              <div class="sugerida">
                <strong>Resposta sugerida</strong>
                <p>${escapeHtml(e.respostaSugerida)}</p>
              </div>
              <div class="row-actions">
                ${btnAuth("Enviar resposta", `data-kind="email" data-id="${e.id}"`)}
                ${btnAuth("Marcar como lido", `data-kind="email-lido" data-id="${e.id}"`)}
              </div>
            </article>`
            )
            .join("")}
        </div>
      </div>`;

    root.querySelectorAll("[data-canal]").forEach((b) => {
      b.addEventListener("click", () => {
        msgCanal = b.getAttribute("data-canal");
        renderMensagens();
      });
    });
    root.querySelectorAll("[data-wa]").forEach((b) => {
      b.addEventListener("click", () => {
        waAtivo = b.getAttribute("data-wa");
        renderMensagens();
      });
    });
    bindAuthButtons(root, ({ id, kind }) => {
      if (kind === "wa") {
        const c = D.mensagens.whatsapp.find((x) => x.id === id);
        return {
          titulo: `Enviar WhatsApp para ${c.contato}`,
          detalhe: `Mensagem: “${c.respostaSugerida}”`,
          sucesso: `WhatsApp enviado para ${c.contato} (simulado).`,
          onOk: () => {
            c.naoLida = false;
            c.thread.push({ de: "eu", texto: c.respostaSugerida, hora: agoraHora() });
          },
          rerender: renderMensagens
        };
      }
      if (kind === "email-lido") {
        const e = D.mensagens.emails.find((x) => x.id === id);
        return {
          titulo: `Marcar e-mail como lido`,
          detalhe: e.assunto,
          sucesso: "E-mail marcado como lido.",
          onOk: () => {
            e.naoLida = false;
          },
          rerender: renderMensagens
        };
      }
      const e = D.mensagens.emails.find((x) => x.id === id);
      return {
        titulo: `Enviar e-mail de resposta`,
        detalhe: `Para ${e.de} · Assunto: ${e.assunto}`,
        sucesso: `E-mail enviado para ${e.de} (simulado).`,
        onOk: () => {
          e.naoLida = false;
        },
        rerender: renderMensagens
      };
    });
  }

  /* —— Estoque —— */
  function renderEstoque() {
    const e = D.estoque;
    const pct = (it) => Math.min(100, Math.round((it.qtd / it.min) * 100));
    $("#view-estoque").innerHTML = `
      <div class="tab-scroll">
        <div class="stat-row four">
          <div class="stat"><div class="label">SKUs</div><div class="value">${e.resumo.skus}</div></div>
          <div class="stat"><div class="label">Críticos</div><div class="value">${e.resumo.criticos}</div></div>
          <div class="stat"><div class="label">Abaixo mín.</div><div class="value">${e.resumo.abaixoMin}</div></div>
          <div class="stat"><div class="label">Valor estoque</div><div class="value" style="font-size:1.05rem">${money(e.resumo.valorTotal)}</div></div>
        </div>
        <h2 class="section-title">Itens</h2>
        ${e.itens
          .map(
            (it) => `
          <article class="list-item">
            <div class="badge">${it.sku}</div>
            <div>
              <h3>${it.nome}</h3>
              <p>${it.qtd} ${it.un} · mín. ${it.min} · ${it.local}</p>
              <div class="progress"><i style="width:${pct(it)}%"></i></div>
              <div class="row-actions">${
                it.status !== "ok"
                  ? btnAuth("Pedir compra", `data-kind="reposicao" data-id="${it.sku}"`)
                  : btnAuth("Reservar para OP-4481", `data-kind="reserva" data-id="${it.sku}"`)
              }</div>
            </div>
            <div class="tag"><span class="status-pill ${it.status === "ok" ? "ok" : it.status === "critico" ? "manut" : "atencao"}">${it.status}</span></div>
          </article>`
          )
          .join("")}
        <h2 class="section-title">Movimentações de hoje</h2>
        ${e.movimentacoes
          .map(
            (m) => `
          <article class="list-item">
            <div class="hora">${m.hora}</div>
            <div><h3>${m.tipo} · ${m.item}</h3><p>${m.qtd} · ${m.dest}</p></div>
            <div class="tag">${m.tipo}</div>
          </article>`
          )
          .join("")}
      </div>`;
    bindAuthButtons($("#view-estoque"), ({ id, kind }) => {
      const it = e.itens.find((x) => x.sku === id);
      if (kind === "reposicao") {
        return {
          titulo: `Gerar SC de reposição — ${it.nome}`,
          detalhe: `Quantidade sugerida até 120% do mínimo (${it.min} ${it.un}).`,
          sucesso: `Solicitação de compra de ${it.sku} criada.`,
          onOk: () => switchTab("compras")
        };
      }
      return {
        titulo: `Reservar ${it.sku}`,
        detalhe: "Reserva para OP-4481 no almoxarifado (simulado).",
        sucesso: `${it.sku} reservado para OP-4481.`
      };
    });
  }

  /* —— Compras + Busca Serper —— */
  function serperCardHtml(item, idx) {
    const initial = item.nome.trim().charAt(0).toUpperCase();
    return `
      <article class="serper-card" style="animation-delay:${idx * 0.05}s">
        <div class="serper-top">
          <div class="serper-favicon" aria-hidden="true">${initial}</div>
          <div class="serper-head">
            <p class="serper-url">${escapeHtml(item.site.replace(/^https?:\/\//, ""))}</p>
            <h3>${escapeHtml(item.nome)}</h3>
            <p class="serper-rating">${escapeHtml(item.rating)}</p>
          </div>
        </div>
        <p class="serper-snippet">${escapeHtml(item.snippet)}</p>
        <dl class="serper-meta">
          <div><dt>Site</dt><dd><a href="${escapeHtml(item.site)}" target="_blank" rel="noopener">${escapeHtml(item.site)}</a></dd></div>
          <div><dt>Telefone</dt><dd>${escapeHtml(item.telefone)}</dd></div>
          <div><dt>Instagram</dt><dd>${escapeHtml(item.instagram)}</dd></div>
          <div><dt>Facebook</dt><dd>${escapeHtml(item.facebook)}</dd></div>
          <div class="full"><dt>Endereço</dt><dd>${escapeHtml(item.endereco)}</dd></div>
        </dl>
        <div class="row-actions">
          <button type="button" class="btn-whatsapp" data-auth data-kind="wa-serper" data-id="${item.id}">Abrir WhatsApp</button>
          ${btnAuth("Salvar no cadastro", `data-kind="salvar-serper" data-id="${item.id}"`)}
          ${btnAuth("Ligar agora", `data-kind="ligar-serper" data-id="${item.id}"`)}
        </div>
      </article>`;
  }

  function renderCompras() {
    const c = D.compras;
    const sug = c.sugestoesBusca[serperTipo] || [];
    const root = $("#view-compras");

    root.innerHTML = `
      <div class="tab-scroll">
        <div class="seg-control">
          <button type="button" class="seg ${comprasPane === "busca" ? "active" : ""}" data-compras-pane="busca">Busca Serper</button>
          <button type="button" class="seg ${comprasPane === "pedidos" ? "active" : ""}" data-compras-pane="pedidos">Pedidos & cotações</button>
        </div>

        <div class="canal-pane ${comprasPane === "busca" ? "show" : ""}">
          <div class="serper-shell">
            <div class="serper-brand">
              <span class="serper-logo">S</span>
              <div>
                <strong>Serper Search</strong>
                <em>Simulado · sem API real</em>
              </div>
            </div>

            <div class="serper-type">
              <button type="button" class="chip-tipo ${serperTipo === "fornecedor" ? "active" : ""}" data-serper-tipo="fornecedor">Fornecedores</button>
              <button type="button" class="chip-tipo ${serperTipo === "cliente" ? "active" : ""}" data-serper-tipo="cliente">Clientes</button>
            </div>

            <form class="serper-form" id="serperForm">
              <input
                type="search"
                id="serperInput"
                value="${escapeHtml(serperQuery)}"
                placeholder="${serperTipo === "cliente" ? "Ex.: construtora estruturas SP" : "Ex.: aço bobina Guarulhos"}"
                aria-label="Busca Serper simulada"
              />
              <button type="submit" class="btn-primary">Pesquisar</button>
            </form>

            <div class="serper-sugestoes">
              ${sug.map((s) => `<button type="button" class="sug-chip" data-sug="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join("")}
            </div>

            <div class="serper-status muted" id="serperStatus">
              ${
                serperBusy
                  ? "Consultando índice simulado…"
                  : serperDidSearch
                    ? `${serperResults.length} resultados para “${escapeHtml(serperQuery)}” · ${serperTipo}s`
                    : "Digite um termo ou escolha uma sugestão para ver resultados completos."
              }
            </div>

            <div class="serper-results" id="serperResults">
              ${
                serperBusy
                  ? `<div class="serper-loading"><span></span><span></span><span></span><p>Buscando ${serperTipo}s…</p></div>`
                  : serperResults.map((item, i) => serperCardHtml(item, i)).join("")
              }
            </div>
          </div>
        </div>

        <div class="canal-pane ${comprasPane === "pedidos" ? "show" : ""}">
          <h2 class="section-title">Fila de compras</h2>
          ${c.abertas
            .map(
              (p) => `
            <article class="list-item">
              <div class="badge">${p.id}</div>
              <div>
                <h3>${p.item}</h3>
                <p>${p.fornecedor} · prazo ${p.prazo} · ${p.status}</p>
                <div class="row-actions">
                  ${
                    p.status === "Aprovar" || p.status === "Cotação"
                      ? btnAuth(p.status === "Aprovar" ? "Aprovar compra" : "Fechar cotação", `data-kind="compra" data-id="${p.id}"`)
                      : btnAuth("Cobrar fornecedor", `data-kind="cobrar-forn" data-id="${p.id}"`)
                  }
                  ${btnAuth(`Buscar ${p.fornecedor}`, `data-kind="busca-forn" data-id="${escapeHtml(p.fornecedor)}"`)}
                </div>
              </div>
              <div class="tag money">${money(p.valor)}</div>
            </article>`
            )
            .join("")}
          <h2 class="section-title">Comparativo de cotações</h2>
          ${c.cotacoes
            .map(
              (q, i) => `
            <article class="cotacao-card">
              <h3>${q.item}</h3>
              <ul>
                <li>${q.f1}</li>
                <li>${q.f2}</li>
                <li>${q.f3}</li>
              </ul>
              <p class="muted">Sugestão Dona Marta: <strong>${q.sugerido}</strong></p>
              <div class="row-actions">${btnAuth(`Escolher ${q.sugerido}`, `data-kind="cotacao" data-id="${i}"`)}</div>
            </article>`
            )
            .join("")}
        </div>
      </div>`;

    root.querySelectorAll("[data-compras-pane]").forEach((b) => {
      b.addEventListener("click", () => {
        comprasPane = b.getAttribute("data-compras-pane");
        renderCompras();
      });
    });
    root.querySelectorAll("[data-serper-tipo]").forEach((b) => {
      b.addEventListener("click", () => {
        serperTipo = b.getAttribute("data-serper-tipo");
        serperResults = [];
        serperDidSearch = false;
        renderCompras();
      });
    });
    root.querySelectorAll("[data-sug]").forEach((b) => {
      b.addEventListener("click", () => {
        executarBuscaSerper(b.getAttribute("data-sug"), serperTipo);
      });
    });
    const form = $("#serperForm", root);
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const q = $("#serperInput", root)?.value?.trim();
        if (!q) {
          showToast("Digite um termo para pesquisar");
          return;
        }
        executarBuscaSerper(q, serperTipo);
      });
    }

    bindAuthButtons(root, ({ id, kind }) => {
      if (kind === "busca-forn") {
        return {
          titulo: `Pesquisar fornecedor ${id}`,
          detalhe: "Vou abrir a busca Serper simulada com esse nome.",
          sucesso: `Buscando ${id}…`,
          onOk: () => executarBuscaSerper(id, "fornecedor")
        };
      }
      if (kind === "wa-serper" || kind === "salvar-serper" || kind === "ligar-serper") {
        const item =
          D.buscaSerper.fornecedor.find((x) => x.id === id) ||
          D.buscaSerper.cliente.find((x) => x.id === id);
        if (!item) return null;
        if (kind === "wa-serper") {
          return {
            titulo: `Abrir WhatsApp — ${item.nome}`,
            detalhe: `Número ${item.whatsapp}. A conversa será aberta no fluxo simulado (sem API real).`,
            sucesso: `WhatsApp com ${item.nome} aberto no simulador.`,
            onOk: () => {
              showToast(`Simulado: wa.me/${item.whatsapp.replace(/\D/g, "")}`);
            }
          };
        }
        if (kind === "ligar-serper") {
          return {
            titulo: `Ligar para ${item.nome}`,
            detalhe: `Telefone ${item.telefone}`,
            sucesso: `Chamada simulada para ${item.telefone}.`
          };
        }
        return {
          titulo: `Salvar ${item.nome} no cadastro`,
          detalhe: "Inclui site, telefone, redes e endereço no CRM simulado.",
          sucesso: `${item.nome} salvo no cadastro.`
        };
      }
      if (kind === "cotacao") {
        const q = c.cotacoes[Number(id)];
        return {
          titulo: `Fechar cotação com ${q.sugerido}`,
          detalhe: `${q.item}. Gerarei o pedido de compra (simulado).`,
          sucesso: `Cotação de ${q.item} fechada com ${q.sugerido}.`
        };
      }
      const p = c.abertas.find((x) => x.id === id);
      if (!p) return null;
      if (kind === "cobrar-forn") {
        return {
          titulo: `Cobrar prazo de ${p.id}`,
          detalhe: `${p.fornecedor} · ${p.item}`,
          sucesso: `Cobrança enviada a ${p.fornecedor}.`
        };
      }
      return {
        titulo: `${p.status === "Aprovar" ? "Aprovar" : "Fechar"} ${p.id}`,
        detalhe: `${p.item} · ${money(p.valor)} · ${p.fornecedor}`,
        sucesso: `${p.id} autorizado no fluxo de compras.`,
        onOk: () => {
          p.status = "Pedido enviado";
        },
        rerender: renderCompras
      };
    });
  }

  /* —— Relatórios —— */
  function renderRelatorios() {
    const r = D.relatorios;
    const maxFat = Math.max(...r.faturamentoMes.map((x) => x.valor));
    const maxOee = 100;
    const points = r.oeeSemana
      .map((v, i) => {
        const x = (i / (r.oeeSemana.length - 1)) * 100;
        const y = 100 - ((v - 70) / 30) * 100;
        return `${x},${y}`;
      })
      .join(" ");

    $("#view-relatorios").innerHTML = `
      <div class="tab-scroll">
        <div class="stat-row">
          <div class="stat"><div class="label">Aprovação qualidade</div><div class="value">${r.qualidade.aprovacao}%</div></div>
          <div class="stat"><div class="label">Entregas no prazo</div><div class="value">${r.entregas.noPrazo}%</div></div>
          <div class="stat"><div class="label">Refugo</div><div class="value">${r.qualidade.refugo}%</div></div>
        </div>

        <h2 class="section-title">OEE da semana</h2>
        <div class="chart-card">
          <svg class="line-chart" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polyline fill="none" stroke="#5a8ab5" stroke-width="2" points="${points}" />
            ${r.oeeSemana
              .map((v, i) => {
                const x = (i / (r.oeeSemana.length - 1)) * 100;
                const y = 100 - ((v - 70) / 30) * 100;
                return `<circle cx="${x}" cy="${y}" r="1.8" fill="#3d6a8f" />`;
              })
              .join("")}
          </svg>
          <div class="chart-labels">
            ${r.dias.map((d, i) => `<span>${d}<br><strong>${r.oeeSemana[i]}%</strong></span>`).join("")}
          </div>
        </div>

        <h2 class="section-title">Faturamento mensal (R$ mil)</h2>
        <div class="chart-card bars">
          ${r.faturamentoMes
            .map(
              (b) => `
            <div class="bar-col">
              <div class="bar-fill" style="height:${(b.valor / maxFat) * 100}%"></div>
              <span>${b.label}<br><strong>${b.valor}</strong></span>
            </div>`
            )
            .join("")}
        </div>

        <h2 class="section-title">Mix de clientes</h2>
        ${r.topClientes
          .map(
            (c) => `
          <article class="list-item">
            <div class="badge">${c.share}%</div>
            <div>
              <h3>${c.nome}</h3>
              <div class="progress"><i style="width:${c.share * 3}%"></i></div>
            </div>
            <div class="tag">share</div>
          </article>`
          )
          .join("")}

        <div class="row-actions" style="margin-top:8px">
          ${btnAuth("Exportar PDF executivo", `data-kind="pdf"`)}
          ${btnAuth("Enviar relatório ao board", `data-kind="board"`)}
        </div>
      </div>`;
    bindAuthButtons($("#view-relatorios"), ({ kind }) => {
      if (kind === "pdf") {
        return {
          titulo: "Exportar PDF executivo",
          detalhe: "Gero um PDF com OEE, qualidade, entregas e mix de clientes (simulado).",
          sucesso: "PDF executivo gerado e salvo em Relatórios."
        };
      }
      return {
        titulo: "Enviar relatório ao board",
        detalhe: "Disparo por e-mail para diretoria com os gráficos do período (simulado).",
        sucesso: "Relatório enviado ao board."
      };
    });
  }

  /* —— Marketing (print-guided) —— */
  function renderMarketing() {
    const m = D.marketing;
    $("#view-marketing").innerHTML = `
      <div class="tab-scroll">
        <div class="print-guide">
          <div class="print-frame">
            <img src="${m.printGuia}" alt="Print da campanha Metalúrgica Almeida Q4" />
            <span class="print-tag">Print guia · campanha Q4</span>
          </div>
          <div class="print-meta">
            <h2 class="section-title">${m.campanhaAtiva.nome}</h2>
            <p class="muted">${m.campanhaAtiva.canal}</p>
            <div class="stat-row" style="margin-top:10px">
              <div class="stat"><div class="label">Status</div><div class="value" style="font-size:1rem">${m.campanhaAtiva.status}</div></div>
              <div class="stat"><div class="label">Período</div><div class="value" style="font-size:.95rem">${m.campanhaAtiva.periodo}</div></div>
              <div class="stat"><div class="label">Orçamento</div><div class="value" style="font-size:1rem">${money(m.campanhaAtiva.orcamento)}</div></div>
            </div>
            <p class="muted" style="margin-top:8px">Gasto atual: ${money(m.campanhaAtiva.gasto)} · As ações abaixo seguem o print como referência visual.</p>
          </div>
        </div>

        <h2 class="section-title">Peças da campanha</h2>
        ${m.pecas
          .map(
            (p, i) => `
          <article class="list-item">
            <div class="badge">0${i + 1}</div>
            <div>
              <h3>${p.tipo}</h3>
              <p>${p.status}</p>
              <div class="row-actions">${btnAuth(p.acao, `data-kind="peca" data-id="${i}"`)}</div>
            </div>
            <div class="tag">Q4</div>
          </article>`
          )
          .join("")}

        <h2 class="section-title">Copy sugerida (alinhada ao print)</h2>
        <article class="cotacao-card">
          <p>${escapeHtml(m.copyPost)}</p>
          <div class="row-actions">${btnAuth("Publicar copy no LinkedIn", `data-kind="copy"`)}</div>
        </article>

        <h2 class="section-title">Leads quentes</h2>
        ${m.leads
          .map(
            (l) => `
          <article class="list-item">
            <div class="badge">${l.score}</div>
            <div>
              <h3>${l.empresa}</h3>
              <p>${l.origem} · ${l.etapa}</p>
              <div class="row-actions">${btnAuth("Agendar follow-up", `data-kind="lead" data-id="${escapeHtml(l.empresa)}"`)}</div>
            </div>
            <div class="tag">CRM</div>
          </article>`
          )
          .join("")}
      </div>`;
    bindAuthButtons($("#view-marketing"), ({ id, kind, btn }) => {
      if (kind === "peca") {
        const p = m.pecas[Number(id)];
        return {
          titulo: p.acao,
          detalhe: `Peça “${p.tipo}” usando o print guia da campanha Q4.`,
          sucesso: `“${p.acao}” autorizado.`,
          onOk: () => {
            p.status = "Autorizado";
          },
          rerender: renderMarketing
        };
      }
      if (kind === "copy") {
        return {
          titulo: "Publicar no LinkedIn",
          detalhe: m.copyPost,
          sucesso: "Post LinkedIn publicado (simulado)."
        };
      }
      return {
        titulo: `Agendar follow-up — ${id}`,
        detalhe: "Vou criar um compromisso na agenda comercial (simulado).",
        sucesso: `Follow-up com ${id} agendado.`
      };
    });
  }

  /* —— Pessoal —— */
  function renderPessoal() {
    const p = D.pessoal;
    $("#view-pessoal").innerHTML = `
      <div class="tab-scroll">
        <div class="stat-row">
          <div class="stat"><div class="label">Headcount</div><div class="value">${p.headcount}</div></div>
          <div class="stat"><div class="label">VT</div><div class="value" style="font-size:1rem">${p.beneficios.vt}</div></div>
          <div class="stat"><div class="label">VR</div><div class="value" style="font-size:1rem">${p.beneficios.vr}</div></div>
        </div>
        <h2 class="section-title">Solicitações pendentes</h2>
        ${p.solicitacoes
          .map(
            (s) => `
          <article class="list-item">
            <div class="badge">${s.id}</div>
            <div>
              <h3>${s.tipo}</h3>
              <p>${s.quem}${s.valor ? " · " + money(s.valor) : ""}</p>
              <div class="row-actions">${btnAuth(s.acao, `data-kind="rh" data-id="${s.id}"`)}</div>
            </div>
            <div class="tag">RH</div>
          </article>`
          )
          .join("")}
        <h2 class="section-title">Férias</h2>
        ${p.ferias
          .map(
            (f) => `
          <article class="list-item">
            <div class="badge">F</div>
            <div><h3>${f.nome}</h3><p>${f.setor} · ${f.periodo}</p></div>
            <div class="tag">${f.status}</div>
          </article>`
          )
          .join("")}
        <h2 class="section-title">Banco de horas</h2>
        ${p.bancoHoras
          .map(
            (b) => `
          <article class="list-item">
            <div class="badge">${b.saldo}</div>
            <div><h3>${b.nome}</h3><p>Limite ${b.limite}</p></div>
            <div class="tag">BH</div>
          </article>`
          )
          .join("")}
        <h2 class="section-title">Admissões</h2>
        ${p.admissoes
          .map(
            (a) => `
          <article class="list-item">
            <div class="badge">+</div>
            <div>
              <h3>${a.nome}</h3>
              <p>${a.cargo} · ${a.data} · ${a.status}</p>
              <div class="row-actions">${btnAuth("Liberar crachá e acessos", `data-kind="admissao" data-id="${escapeHtml(a.nome)}"`)}</div>
            </div>
            <div class="tag">novo</div>
          </article>`
          )
          .join("")}
      </div>`;
    bindAuthButtons($("#view-pessoal"), ({ id, kind }) => {
      if (kind === "admissao") {
        return {
          titulo: `Liberar acessos de ${id}`,
          detalhe: "Crachá, catraca e e-mail corporativo (simulado).",
          sucesso: `Acessos de ${id} liberados.`
        };
      }
      const s = p.solicitacoes.find((x) => x.id === id);
      return {
        titulo: s.acao,
        detalhe: `${s.tipo} · ${s.quem}${s.valor ? " · " + money(s.valor) : ""}`,
        sucesso: `${s.id} autorizado.`,
        onOk: () => {
          D.pessoal.solicitacoes = D.pessoal.solicitacoes.filter((x) => x.id !== id);
        },
        rerender: renderPessoal
      };
    });
  }

  /* —— Treinamento —— */
  function renderTreinamento() {
    const t = D.treinamento;
    $("#view-treinamento").innerHTML = `
      <div class="tab-scroll">
        <h2 class="section-title">Obrigatórios / NRs</h2>
        ${t.obrigatorios
          .map(
            (o, i) => `
          <article class="list-item">
            <div class="badge">${o.pendentes}</div>
            <div>
              <h3>${o.nome}</h3>
              <p>Vencimento ${o.vencimento} · ${o.status}</p>
              <div class="row-actions">${btnAuth("Convocar pendentes", `data-kind="nr" data-id="${i}"`)}</div>
            </div>
            <div class="tag">${o.status}</div>
          </article>`
          )
          .join("")}
        <h2 class="section-title">Agenda de treinamentos</h2>
        ${t.agenda
          .map(
            (a, i) => `
          <article class="list-item">
            <div class="hora">${a.data}<br>${a.hora}</div>
            <div>
              <h3>${a.titulo}</h3>
              <p>${a.local} · vagas ${a.vagas}</p>
              <div class="row-actions">${btnAuth("Confirmar turma", `data-kind="turma" data-id="${i}"`)}</div>
            </div>
            <div class="tag">SST</div>
          </article>`
          )
          .join("")}
        <h2 class="section-title">Progresso individual</h2>
        ${t.colaboradores
          .map(
            (c) => `
          <article class="list-item">
            <div class="badge">${c.progresso}%</div>
            <div>
              <h3>${c.nome}</h3>
              <p>${c.curso}</p>
              <div class="progress"><i style="width:${c.progresso}%"></i></div>
            </div>
            <div class="tag">curso</div>
          </article>`
          )
          .join("")}
      </div>`;
    bindAuthButtons($("#view-treinamento"), ({ id, kind }) => {
      if (kind === "nr") {
        const o = t.obrigatorios[Number(id)];
        return {
          titulo: `Convocar pendentes — ${o.nome}`,
          detalhe: `${o.pendentes} colaboradores · vencimento ${o.vencimento}`,
          sucesso: `Convocação de ${o.nome} enviada.`
        };
      }
      const a = t.agenda[Number(id)];
      return {
        titulo: `Confirmar turma — ${a.titulo}`,
        detalhe: `${a.data} ${a.hora} · ${a.local}`,
        sucesso: `Turma “${a.titulo}” confirmada.`
      };
    });
  }

  function renderNotificacoes() {
    atualizarBadgeNotif();
    if (drawerOpen) renderDrawer();
  }

  function promptsDoModulo(id) {
    return MODULE_PROMPTS[id] || PROMPT_EXAMPLES;
  }

  function atualizarPlaceholder(id) {
    const list = promptsDoModulo(id);
    if (els.chatInput) {
      els.chatInput.placeholder = `Ex.: ${list[0]}`;
      els.chatInput.dataset.promptIndex = "0";
    }
  }

  function iniciarPlaceholderRotativo() {
    if (iniciarPlaceholderRotativo._t) clearInterval(iniciarPlaceholderRotativo._t);
    iniciarPlaceholderRotativo._t = setInterval(() => {
      if (!els.chatInput || document.activeElement === els.chatInput) return;
      const list = promptsDoModulo(currentModule);
      const i = (Number(els.chatInput.dataset.promptIndex || 0) + 1) % list.length;
      els.chatInput.dataset.promptIndex = String(i);
      els.chatInput.placeholder = `Ex.: ${list[i]}`;
    }, 4200);
  }

  function renderSugestoes() {
    els.sugestoes.innerHTML = "";
    const list = [...promptsDoModulo(currentModule).slice(0, 4), "Ver avisos"];
    list.forEach((s) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = s;
      b.addEventListener("click", () => {
        if (/aviso|notif/i.test(s)) {
          abrirGaveta();
          return;
        }
        sendUserText(s);
      });
      els.sugestoes.appendChild(b);
    });
  }

  function renderInicioPainel() {
    const root = $("#view-inicio");
    if (!root) return;
    root.innerHTML = `
      <div class="tab-scroll" style="padding:12px 14px 16px">
        <p class="muted" style="margin-bottom:10px">O chat acima é o centro do app. Abra este painel só se quiser ver atalhos rápidos de dados.</p>
        <div class="metric-list">
          ${(D.resumoDia.metricas || [])
            .map(
              (m) => `
            <button type="button" class="metric-row tone-${escapeHtml(m.tom)}" data-tab-jump="${escapeHtml(m.tab)}">
              <span class="metric-icon" aria-hidden="true">${metricaIcon(m.icon)}</span>
              <span class="metric-body">
                <span class="metric-title">${escapeHtml(m.titulo)}</span>
                <strong class="metric-value">${escapeHtml(m.valor)}</strong>
                <span class="metric-sub">${escapeHtml(m.sub)}</span>
              </span>
              <span class="metric-chev">›</span>
            </button>`
            )
            .join("")}
        </div>
      </div>`;
    root.querySelectorAll("[data-tab-jump]").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.getAttribute("data-tab-jump")));
    });
  }

  function syncMasterButtons(hub) {
    $$(".master-btn").forEach((b) => {
      const on = hub && b.dataset.master === hub;
      b.classList.toggle("active", on);
      b.setAttribute("aria-selected", on ? "true" : "false");
    });
  }

  function renderHubSubnav(hub, activeTab) {
    if (!els.hubSubnav) return;
    const cfg = hub ? HUBS[hub] : null;
    if (!cfg || cfg.tabs.length <= 1) {
      els.hubSubnav.hidden = true;
      els.hubSubnav.innerHTML = "";
      return;
    }
    els.hubSubnav.hidden = false;
    els.hubSubnav.innerHTML = cfg.tabs
      .map(
        (t) =>
          `<button type="button" class="hub-chip ${t.id === activeTab ? "active" : ""}" data-tab="${t.id}">${t.label}</button>`
      )
      .join("");
    els.hubSubnav.querySelectorAll(".hub-chip").forEach((chip) => {
      chip.addEventListener("click", () => switchTab(chip.dataset.tab));
    });
  }

  function openMaster(hub) {
    const cfg = HUBS[hub];
    if (!cfg) return;
    activeHub = hub;
    switchTab(cfg.default);
  }

  function switchTab(id) {
    if (id === "notificacoes") {
      abrirGaveta();
      return;
    }
    currentModule = id || "inicio";
    if (id === "inicio" || id === "treinamento") activeHub = null;
    else if (TAB_TO_HUB[id]) activeHub = TAB_TO_HUB[id];

    syncMasterButtons(activeHub);
    renderHubSubnav(activeHub, id);

    $$(".mod-acc").forEach((acc) => {
      const on = acc.dataset.module === id;
      acc.hidden = !on;
      if (on) {
        // dados sempre fechados por padrão ao entrar no módulo
        acc.open = false;
      }
    });

    const view = $(`#view-${id}`);
    if (view) {
      els.panelTitle.textContent = view.dataset.title || "Chat com a Dona Marta";
      els.panelSub.textContent =
        view.dataset.sub || "Pergunte qualquer coisa — os dados ficam nos painéis abaixo";
    }

    atualizarPlaceholder(id);
    renderSugestoes();

    // mantém o chat em foco visual
    els.chatInput?.focus({ preventScroll: true });
    requestAnimationFrame(() => {
      if (els.chatScroll) els.chatScroll.scrollTop = els.chatScroll.scrollHeight;
    });
  }

  async function simulateListen() {
    if (!voiceOn) {
      showToast("Ligue o modo voz para falar com a Dona Marta");
      return;
    }
    if (speaking) pararFala();
    listening = true;
    setVoiceUI("listening");
    showToast("Ouvindo… (simulado)");
    await delay(1400);
    if (!voiceOn) {
      listening = false;
      setVoiceUI("idle");
      return;
    }
    listening = false;
    const frases = [
      "Pesquisar fornecedor de aço em Guarulhos",
      "Buscar cliente construtora",
      "Ver estoque",
      "Alertas urgentes",
      "Notificações"
    ];
    const frase = frases[Math.floor(Math.random() * frases.length)];
    showToast(`Reconhecido: “${frase}”`);
    setVoiceUI("idle");
    await sendUserText(frase);
  }

  function toggleMic() {
    if (listening && voiceOn) return;
    setVoiceMode(!voiceOn, { announce: true, autoListen: false });
  }

  function iniciarFilaNotificacoes() {
    const fila = (D.notificacoes || []).filter((n) => !n.lida);
    let i = 0;
    clearInterval(notifTimer);
    notifTimer = setInterval(() => {
      if (!fila.length) return;
      const n = fila[i % fila.length];
      i += 1;
      pushNotifCard({
        titulo: n.titulo,
        detalhe: n.detalhe,
        tipo: n.tipo,
        acaoLabel: n.acao,
        onAction: async () => {
          await acaoComAuth({
            titulo: n.acao,
            detalhe: `${n.titulo} — ${n.detalhe}`,
            sucesso: `“${n.acao}” autorizado.`,
            fala: `Recebi o aviso ${n.titulo}. Posso ${n.acao.toLowerCase()}? Confirme por voz ou botão.`,
            onOk: () => {
              n.lida = true;
              renderNotificacoes();
            }
          });
        }
      });
    }, 18000);
  }

  async function bootGreeting() {
    setVoiceMode(true, { announce: false, autoListen: false });
    setVoiceUI("speaking");
    showToast("Modo voz ativo");

    appendMessage({
      role: "marta",
      html: resumoHtml(),
      chips: ["Pesquisar fornecedor de aço", "Buscar cliente construtora", "Estoque", "Ver avisos"],
      hora: "07:58"
    });

    await delay(350);
    const metricasFala = (D.resumoDia.metricas || [])
      .map((m) => `${m.titulo}: ${m.valor}. ${m.sub}`)
      .join(" ");
    const script = [
      D.resumoDia.saudacao,
      D.resumoDia.intro,
      metricasFala,
      D.resumoDia.fechamento
    ].join(" ");
    await speak(script);

    if (!voiceOn) {
      setVoiceUI("idle");
      return;
    }

    atualizarBadgeNotif();
    const primeira = (D.notificacoes || []).find((n) => !n.lida);
    if (primeira) {
      await speak(`Você tem avisos na gaveta. O primeiro: ${primeira.titulo}.`);
    }

    iniciarFilaNotificacoes();
    setVoiceUI("idle");
  }

  function bind() {
    $$(".master-btn").forEach((btn) => {
      btn.addEventListener("click", () => openMaster(btn.dataset.master));
    });

    $("#btnHome")?.addEventListener("click", () => switchTab("inicio"));

    $$("[data-shortcut]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.shortcut;
        if (key === "audio") {
          setVoiceMode(!voiceOn, { announce: true, autoListen: false });
          return;
        }
        if (key === "documentos") {
          switchTab("financeiro");
          return;
        }
        if (key === "treinamento") {
          switchTab("treinamento");
          return;
        }
        if (key === "notificacoes") {
          drawerOpen ? fecharGaveta() : abrirGaveta();
        }
      });
    });

    els.drawerClose?.addEventListener("click", fecharGaveta);
    els.drawerBackdrop?.addEventListener("click", fecharGaveta);
    els.drawerMarkAll?.addEventListener("click", async () => {
      await acaoComAuth({
        titulo: "Marcar todas como lidas",
        detalhe: "Limpa os avisos não lidos na gaveta.",
        sucesso: "Todas as notificações foram marcadas como lidas.",
        onOk: () => D.notificacoes.forEach((n) => (n.lida = true))
      });
      renderDrawer();
      atualizarBadgeNotif();
    });

    els.composer.addEventListener("submit", (e) => {
      e.preventDefault();
      sendUserText(els.chatInput.value);
    });

    els.btnVoiceToggle?.addEventListener("click", (e) => {
      e.stopPropagation();
      setVoiceMode(!voiceOn, { announce: true, autoListen: false });
    });

    els.btnMic.addEventListener("click", () => {
      if (els.authOverlay && !els.authOverlay.hidden) {
        if (!voiceOn) {
          showToast("Ligue o modo voz para confirmar por voz");
          return;
        }
        confirmarPorVoz(true);
        return;
      }
      if (!voiceOn) {
        setVoiceMode(true, { announce: true, autoListen: true });
        return;
      }
      if (!listening && !speaking) simulateListen();
    });

    els.voiceBadge?.addEventListener("click", () => {
      if (els.authOverlay && !els.authOverlay.hidden && voiceOn) {
        confirmarPorVoz(true);
      }
    });

    els.authAllow.addEventListener("click", () => fecharAuth(true));
    els.authDeny.addEventListener("click", () => fecharAuth(false));
    els.authVoiceYes?.addEventListener("click", () => confirmarPorVoz(true));
    els.authVoiceNo?.addEventListener("click", () => confirmarPorVoz(false));
    els.authOverlay.addEventListener("click", (e) => {
      if (e.target === els.authOverlay) fecharAuth(false);
    });

    els.chatScroll?.addEventListener("click", (e) => {
      const row = e.target.closest("[data-tab-jump]");
      if (row) {
        const tab = row.getAttribute("data-tab-jump");
        if (tab) switchTab(tab);
        return;
      }
      const chip = e.target.closest(".msg-chips button");
      if (chip && /aviso|notif/i.test(chip.textContent || "")) {
        e.preventDefault();
        e.stopPropagation();
        abrirGaveta();
      }
    });
  }

  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.getRegistrations().then((regs) => {
      regs.forEach((r) => r.update());
    });
    navigator.serviceWorker.register("./sw.js?v=10").catch(() => {});
  }

  function init() {
    renderInicioPainel();
    renderAgenda();
    renderProducao();
    renderEquipe();
    renderFinanceiro();
    renderAlertas();
    renderMensagens();
    renderEstoque();
    renderCompras();
    renderRelatorios();
    renderMarketing();
    renderPessoal();
    renderTreinamento();
    renderNotificacoes();
    switchTab("inicio");
    bind();
    registerSW();
    syncVoiceControls();
    setVoiceUI("idle");
    iniciarPlaceholderRotativo();
    bootGreeting();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
