window.DONA_MARTA_DATA = {
  empresa: {
    nome: "Metalúrgica Almeida",
    unidade: "Planta Guarulhos — SP",
    turno: "1º turno (06:00–14:00)",
    dataRef: "23/11/2026",
    responsavel: "Carlos Almeida",
    cargo: "Diretor Industrial"
  },

  resumoDia: {
    saudacao: "Bom dia!",
    intro: "Aqui está o resumo do seu negócio hoje:",
    pontos: [
      "Produção: linha de estamparia a 92% da meta; corte a laser em manutenção programada até 10h30.",
      "Agenda: 3 reuniões — a primeira às 9h com o fornecedor Aço Norte sobre atraso de bobinas.",
      "Equipe: 47 presentes, 2 faltas justificadas e 1 atestado. Soldadores extras cobrindo a linha 3.",
      "Financeiro: 2 notas a vencer hoje (R$ 48.700) e recebimento previsto da Construtora Vale Azul às 14h.",
      "Alerta: estoque de eletrodos E7018 abaixo do mínimo — pedido de reposição já sugerido."
    ],
    metricas: [
      {
        id: "vendas",
        tom: "green",
        titulo: "Recebimentos Hoje",
        valor: "R$ 126.500",
        sub: "+ entrada Vale Azul às 14h",
        tab: "financeiro",
        icon: "money"
      },
      {
        id: "pedidos",
        tom: "blue",
        titulo: "Pedidos / OPs",
        valor: "23",
        sub: "8 aguardando confirmação",
        tab: "producao",
        icon: "bag"
      },
      {
        id: "estoque",
        tom: "orange",
        titulo: "Estoque Baixo",
        valor: "7 produtos",
        sub: "Itens precisam de reposição",
        tab: "estoque",
        icon: "warn"
      },
      {
        id: "pagar",
        tom: "purple",
        titulo: "Contas a Pagar",
        valor: "R$ 48.700",
        sub: "Vencimentos próximos",
        tab: "financeiro",
        icon: "doc"
      }
    ],
    fechamento:
      "Estou no modo voz. Antes de qualquer ação importante, peço sua confirmação por voz ou pelo botão Autorizar."
  },

  sugestoesRapidas: [
    "Como está a produção?",
    "Próxima reunião",
    "Quem faltou hoje?",
    "Alertas urgentes",
    "Notas a pagar",
    "Status da linha 3"
  ],

  conversasIniciais: [
    {
      role: "marta",
      tipo: "resumo",
      hora: "07:58"
    }
  ],

  respostasSimuladas: {
    producao: {
      texto:
        "Na produção agora: estamparia em 184 peças/hora (meta 200). Solda MIG na linha 3 está estável com 3 operadores. O corte a laser volta às 10h30 após troca de lente. Pedidos prioritários: OP-4481 (estruturas Vale Azul) e OP-4490 (grades Industrias Rio).",
      chips: ["Detalhar OP-4481", "Manutenção laser", "OEE do turno"]
    },
    reuniao: {
      texto:
        "Sua próxima reunião é às 09:00 com Aço Norte (fornecedor). Pauta: atraso de 3 dias nas bobinas SAE 1020 e renegociação de frete. Sala: reunião virtual — link já está no calendário. Quer que eu prepare os pontos de cobrança?",
      chips: ["Preparar pauta", "Ver agenda completa", "Ligar para Aço Norte"]
    },
    faltas: {
      texto:
        "Hoje: Marcos Oliveira (soldador) — atestado; Ana Paula Costa (qualidade) — consulta médica; Pedro Nunes (logística) — falta justificada. A cobertura da solda está com Júlio e Renata na linha 3.",
      chips: ["Escala de cobertura", "RH — atestados", "Contato dos ausentes"]
    },
    alertas: {
      texto:
        "Há 3 alertas ativos: 1) eletrodos E7018 em 18% do mínimo; 2) compressor 02 vibração acima do limite desde 06:40; 3) NF 8821 vence hoje às 17h (R$ 31.200 — Fornecedor MetalSul). Posso priorizar qualquer um.",
      chips: ["Comprar eletrodos", "Ver compressor", "Pagar NF 8821"]
    },
    financeiro: {
      texto:
        "Caixa do dia: saídas previstas R$ 48.700 (duas NFs). Entrada prevista R$ 126.500 da Construtora Vale Azul. Contas a receber em atraso: 1 título de R$ 22.400 (há 4 dias). Posição de caixa estimada ao fim do dia: positiva em ~R$ 74 mil.",
      chips: ["Detalhar NFs", "Cobrar atraso", "Fluxo da semana"]
    },
    linha3: {
      texto:
        "Linha 3 (solda estrutural): OEE 87%, disponibilidade 94%, qualidade 98%. Última parada: 12 min para troca de bico. OP atual: 4481 — 62% concluída. Previsão de finalização: 13:20 se mantiver o ritmo.",
      chips: ["Foto do painel", "Chamar supervisor", "Histórico OEE"]
    },
    default: {
      texto:
        "Entendi. Com base nos dados da Metalúrgica Almeida de hoje, posso te ajudar com produção, agenda, equipe, financeiro ou alertas. O que prefere olhar primeiro?",
      chips: ["Resumo completo", "Produção", "Agenda", "Alertas"]
    }
  },

  agenda: [
    {
      hora: "09:00",
      titulo: "Aço Norte — atraso de bobinas",
      tipo: "Fornecedor",
      local: "Meet · Sala Virtual 1",
      status: "Em breve",
      detalhe: "Bobinas SAE 1020 · 12 ton · atraso 3 dias"
    },
    {
      hora: "10:45",
      titulo: "Daily produção com supervisores",
      tipo: "Interna",
      local: "Sala de Controle",
      status: "Confirmada",
      detalhe: "OEE, paradas e OP prioritárias"
    },
    {
      hora: "14:00",
      titulo: "Construtora Vale Azul — recebimento",
      tipo: "Cliente",
      local: "Financeiro · ramal 204",
      status: "Agendada",
      detalhe: "NF 9104 · R$ 126.500"
    },
    {
      hora: "16:30",
      titulo: "Revisão de segurança — área de corte",
      tipo: "SST",
      local: "Pátio de Corte",
      status: "Agendada",
      detalhe: "Checklist EPIs e isolamento de área"
    }
  ],

  producao: {
    oeeGeral: 89,
    metaPecas: 1600,
    pecasFeitas: 1472,
    linhas: [
      { nome: "Estamparia", oee: 92, status: "ok", detalhes: "184 pç/h · 2 setup restantes" },
      { nome: "Corte Laser", oee: 0, status: "manut", detalhes: "Parada programada · retorno 10:30" },
      { nome: "Solda Linha 3", oee: 87, status: "ok", detalhes: "OP-4481 · 62% · 3 operadores" },
      { nome: "Pintura", oee: 78, status: "atencao", detalhes: "Cabine 2 com fila · +22 min" },
      { nome: "Expedição", oee: 95, status: "ok", detalhes: "4 cargas liberadas · 1 aguardando" }
    ],
    ops: [
      { id: "OP-4481", cliente: "Vale Azul", progresso: 62, prioridade: "Alta" },
      { id: "OP-4490", cliente: "Indústrias Rio", progresso: 41, prioridade: "Alta" },
      { id: "OP-4472", cliente: "MetalSul", progresso: 88, prioridade: "Média" },
      { id: "OP-4501", cliente: "Torre Norte", progresso: 15, prioridade: "Baixa" }
    ]
  },

  equipe: {
    presentes: 47,
    faltas: 3,
    total: 50,
    setores: [
      { nome: "Produção", presentes: 28, ausentes: 2 },
      { nome: "Qualidade", presentes: 5, ausentes: 1 },
      { nome: "Logística", presentes: 6, ausentes: 0 },
      { nome: "Manutenção", presentes: 4, ausentes: 0 },
      { nome: "Administrativo", presentes: 4, ausentes: 0 }
    ],
    ausencias: [
      { nome: "Marcos Oliveira", cargo: "Soldador", motivo: "Atestado", cobertura: "Júlio Mendes" },
      { nome: "Ana Paula Costa", cargo: "Inspetora Qualidade", motivo: "Consulta", cobertura: "Equipe Q1" },
      { nome: "Pedro Nunes", cargo: "Aux. Logística", motivo: "Justificada", cobertura: "Turno cruzado" }
    ],
    destaques: [
      { nome: "Renata Silva", nota: "Cobertura linha 3 · +14% eficiência" },
      { nome: "Bruno Ferreira", nota: "Zero refugo na estamparia (turno)" }
    ]
  },

  financeiro: {
    caixaEstimado: 74200,
    saidasHoje: [
      { numero: "8821", nf: "NF 8821", fornecedor: "MetalSul", valor: 31200, vence: "17:00", descricao: "Consumíveis de solda · boleto bancário" },
      { numero: "8830", nf: "NF 8830", fornecedor: "Gás Industrial SP", valor: 17500, vence: "16:00", descricao: "Cilindros Ar+CO₂ · vencimento hoje" },
      { numero: "8842", nf: "NF 8842", fornecedor: "EPI Brasil", valor: 4800, vence: "18:30", descricao: "Luvas e óculos de proteção" }
    ],
    entradasHoje: [
      { numero: "9104", nf: "NF 9104", cliente: "Construtora Vale Azul", fornecedor: "Construtora Vale Azul", valor: 126500, previsao: "14:00", descricao: "Recebimento OP-4481 · estruturas" },
      { numero: "9110", nf: "NF 9110", cliente: "Indústrias Rio", fornecedor: "Indústrias Rio", valor: 38200, previsao: "16:30", descricao: "Parcial grades OP-4490" }
    ],
    atrasos: [
      { numero: "4412", nf: "Título 4412", titulo: "Título 4412", cliente: "Oficina Horizonte", fornecedor: "Oficina Horizonte", valor: 22400, dias: 4, descricao: "Peças estruturais · cobrança amigável" }
    ]
  },

  alertas: [
    {
      nivel: "critico",
      titulo: "Estoque baixo — Eletrodos E7018",
      detalhe: "18% do mínimo · consumo estimado cobre até quarta 12h",
      acao: "Gerar pedido de compra"
    },
    {
      nivel: "alto",
      titulo: "Compressor 02 — vibração elevada",
      detalhe: "Limite ultrapassado desde 06:40 · manutenção avisada",
      acao: "Abrir OS corretiva"
    },
    {
      nivel: "medio",
      titulo: "NF 8821 vence hoje",
      detalhe: "R$ 31.200 · MetalSul · vencimento 17:00",
      acao: "Agendar pagamento"
    },
    {
      nivel: "baixo",
      titulo: "EPI — luvas nitrílicas",
      detalhe: "Estoque em 35% · reposição sugerida na sexta",
      acao: "Incluir no pedido semanal"
    }
  ],

  mensagens: {
    whatsapp: [
      {
        id: "wa1",
        contato: "João — Aço Norte",
        telefone: "+55 11 98821-4402",
        hora: "08:12",
        naoLida: true,
        preview: "Bobinas SAE 1020 saem amanhã 14h. Confirma recebimento?",
        thread: [
          { de: "eles", texto: "Bom dia, Carlos. Sobre o atraso das bobinas…", hora: "07:55" },
          { de: "eles", texto: "Conseguimos liberar 12 ton amanhã às 14h. Confirma o recebimento na Guarulhos?", hora: "08:12" }
        ],
        respostaSugerida:
          "Bom dia, João. Confirmado o recebimento amanhã 14h na planta Guarulhos. Por favor envie a NF antecipada."
      },
      {
        id: "wa2",
        contato: "Marina — Vale Azul",
        telefone: "+55 11 97710-2201",
        hora: "08:40",
        naoLida: true,
        preview: "Podem antecipar 40% da OP-4481 para quinta?",
        thread: [
          { de: "eles", texto: "Oi! Precisamos antecipar 40% da OP-4481 para quinta-feira. É possível?", hora: "08:40" }
        ],
        respostaSugerida:
          "Marina, boa tarde. Vou alinhar com produção e retorno até 11h com a viabilidade da antecipação."
      },
      {
        id: "wa3",
        contato: "Grupo Supervisores MA",
        telefone: "Grupo · 6 participantes",
        hora: "07:20",
        naoLida: false,
        preview: "Renata: Linha 3 ok. Laser ainda em manutenção.",
        thread: [
          { de: "eles", texto: "Renata: Bom dia. Linha 3 estável.", hora: "07:15" },
          { de: "eles", texto: "Bruno: Estamparia no ritmo.", hora: "07:18" },
          { de: "eles", texto: "Renata: Laser ainda em manutenção até 10h30.", hora: "07:20" }
        ],
        respostaSugerida: "Obrigado, equipe. Mantenham foco na OP-4481. Qualquer desvio me avisem."
      },
      {
        id: "wa4",
        contato: "Transportadora Ligeira",
        telefone: "+55 11 96500-1188",
        hora: "ontem",
        naoLida: false,
        preview: "Caminhão 03 disponível às 15h para Vale Azul.",
        thread: [
          { de: "eles", texto: "Caminhão 03 disponível às 15h para coleta Vale Azul.", hora: "18:02" }
        ],
        respostaSugerida: "Perfeito. Confirmamos coleta às 15h no doca 2."
      }
    ],
    emails: [
      {
        id: "em1",
        de: "compras@metalsul.com.br",
        assunto: "Cobrança NF 8821 — vencimento hoje",
        hora: "07:45",
        naoLida: true,
        resumo: "Lembrete amigável do boleto MetalSul R$ 31.200 com vencimento às 17h.",
        corpo: "Prezados,\n\nSegue lembrete da NF 8821 no valor de R$ 31.200,00 com vencimento hoje às 17h.\nFavor confirmar o pagamento.\n\nAtt,\nContas a Receber — MetalSul",
        respostaSugerida:
          "Prezados, confirmamos o agendamento do pagamento da NF 8821 ainda hoje. Enviaremos o comprovante assim que liquidado."
      },
      {
        id: "em2",
        de: "qualidade@industriasrio.com.br",
        assunto: "Relatório dimensional — lote OP-4490",
        hora: "08:05",
        naoLida: true,
        resumo: "Solicitam laudo dimensional das grades do lote OP-4490 antes do embarque.",
        corpo: "Bom dia,\n\nSolicitamos o laudo dimensional das grades referentes à OP-4490 antes do embarque previsto.\nPrazo desejado: até 16h de hoje.\n\nAbs,\nQualidade — Indústrias Rio",
        respostaSugerida:
          "Bom dia. O laudo dimensional da OP-4490 será emitido pela Qualidade até 15h30 e enviado em cópia a este e-mail."
      },
      {
        id: "em3",
        de: "rh@metalurgicaalmeida.local",
        assunto: "Folha ponto — fechamento quinzena",
        hora: "ontem",
        naoLida: false,
        resumo: "Lembrete interno: validar ponto até quarta 12h.",
        corpo: "Carlos,\n\nLembrete: validação da folha ponto da quinzena até quarta-feira 12h.\nHá 3 pendências de ajuste de banco de horas.\n\nRH",
        respostaSugerida: "Ciente. Valido as 3 pendências até amanhã 10h."
      },
      {
        id: "em4",
        de: "orcamentos@torrenorte.com.br",
        assunto: "Pedido de cotação — escadas marinheiro",
        hora: "ontem",
        naoLida: false,
        resumo: "Nova RFQ: 18 escadas marinheiro com corrimão, entrega dez/2026.",
        corpo: "Prezados,\n\nSolicitamos cotação para 18 escadas marinheiro com corrimão, conforme anexo técnico.\nEntrega desejada: dezembro/2026.\n\nTorre Norte",
        respostaSugerida:
          "Prezados, recebemos a RFQ. Retornaremos a cotação formal em até 2 dias úteis."
      }
    ]
  },

  estoque: {
    resumo: { skus: 186, criticos: 4, abaixoMin: 9, valorTotal: 1842000 },
    itens: [
      { sku: "MAT-1020", nome: "Bobina SAE 1020 1,2mm", qtd: 8.4, un: "ton", min: 10, local: "Pátio A", status: "baixo" },
      { sku: "ELET-7018", nome: "Eletrodo E7018 3,25mm", qtd: 42, un: "kg", min: 230, local: "Almox 2", status: "critico" },
      { sku: "GAS-ARCO", nome: "Gás Ar+CO₂ 20%", qtd: 14, un: "cil", min: 12, local: "Central Gases", status: "ok" },
      { sku: "TINT-CZ", nome: "Tinta epóxi cinza RAL 7035", qtd: 68, un: "L", min: 80, local: "Pintura", status: "baixo" },
      { sku: "PARAF-M12", nome: "Parafuso sext. M12x40", qtd: 4200, un: "un", min: 2000, local: "Almox 1", status: "ok" },
      { sku: "DISCO-CUT", nome: "Disco de corte 12\"", qtd: 28, un: "un", min: 40, local: "Ferramentaria", status: "baixo" },
      { sku: "LUVA-NIT", nome: "Luva nitrílica G", qtd: 110, un: "par", min: 300, local: "EPI", status: "critico" },
      { sku: "CHAPA-38", nome: "Chapa naval 3/8\"", qtd: 22, un: "ch", min: 15, local: "Pátio B", status: "ok" }
    ],
    movimentacoes: [
      { hora: "06:55", tipo: "Saída", item: "Eletrodo E7018", qtd: "18 kg", dest: "Linha 3" },
      { hora: "07:40", tipo: "Entrada", item: "Disco de corte 12\"", qtd: "10 un", dest: "NF 9901" },
      { hora: "08:10", tipo: "Saída", item: "Tinta epóxi cinza", qtd: "12 L", dest: "Cabine 2" }
    ]
  },

  compras: {
    abertas: [
      { id: "SC-1044", item: "Eletrodo E7018 3,25mm — 300 kg", fornecedor: "Soldamax", valor: 9840, status: "Aprovar", prazo: "24h" },
      { id: "SC-1041", item: "Bobina SAE 1020 — 15 ton", fornecedor: "Aço Norte", valor: 118500, status: "Cotação", prazo: "48h" },
      { id: "SC-1038", item: "Luvas nitrílicas G — 400 par", fornecedor: "EPI Brasil", valor: 3200, status: "Aprovar", prazo: "Hoje" },
      { id: "PC-992", item: "Lente corte laser 2\"", fornecedor: "LaserParts", valor: 2750, status: "Pedido enviado", prazo: "03 dias" }
    ],
    cotacoes: [
      { item: "Bobina SAE 1020", f1: "Aço Norte R$ 7.900/t", f2: "FerroSul R$ 8.050/t", f3: "MetalPrime R$ 7.870/t", sugerido: "MetalPrime" },
      { item: "Eletrodo E7018", f1: "Soldamax R$ 32,80/kg", f2: "WeldCenter R$ 34,10/kg", f3: "—", sugerido: "Soldamax" }
    ],
    sugestoesBusca: {
      fornecedor: ["aço bobina Guarulhos", "eletrodo E7018 SP", "EPI industrial São Paulo", "gás argon solda"],
      cliente: ["construtora estruturas SP", "indústria grades metálicas", "obra galpão Guarulhos", "escadas marinheiro"]
    }
  },

  buscaSerper: {
    fornecedor: [
      {
        id: "f1",
        nome: "Aço Norte Distribuidora Ltda",
        site: "https://www.aconorte.fake.br",
        telefone: "(11) 4122-8800",
        whatsapp: "+55 11 98821-4402",
        instagram: "@aconorte.oficial",
        facebook: "facebook.com/aconorte",
        endereco: "Av. Prestes Maia, 1450 — Cumbica, Guarulhos/SP",
        snippet: "Bobinas SAE 1008/1020, chapas e tubos. Entrega em 24–48h na Grande SP.",
        rating: "4,7 · 128 avaliações",
        tags: ["aço", "bobina", "guarulhos", "sae", "1020"]
      },
      {
        id: "f2",
        nome: "Soldamax Consumíveis",
        site: "https://www.soldamax.fake.br",
        telefone: "(11) 3991-2204",
        whatsapp: "+55 11 97654-2210",
        instagram: "@soldamax.br",
        facebook: "facebook.com/soldamaxbr",
        endereco: "Rua da Mooca, 890 — Mooca, São Paulo/SP",
        snippet: "Eletrodos E7018, arames MIG e gás. Atendimento B2B com nota no mesmo dia.",
        rating: "4,8 · 96 avaliações",
        tags: ["eletrodo", "e7018", "solda", "mig", "sp"]
      },
      {
        id: "f3",
        nome: "MetalPrime Aços Planos",
        site: "https://www.metalprime.fake.com.br",
        telefone: "(11) 2402-5511",
        whatsapp: "+55 11 99102-3344",
        instagram: "@metalprime.acos",
        facebook: "facebook.com/metalprime",
        endereco: "Rod. Pres. Dutra, km 215 — Guarulhos/SP",
        snippet: "Aços planos e especiais. Cotação competitiva para lotes acima de 10 ton.",
        rating: "4,6 · 74 avaliações",
        tags: ["aço", "bobina", "chapas", "guarulhos", "metalprime"]
      },
      {
        id: "f4",
        nome: "EPI Brasil Segurança",
        site: "https://www.epibrasil.fake.br",
        telefone: "(11) 3333-9090",
        whatsapp: "+55 11 98200-7711",
        instagram: "@epibrasil.seg",
        facebook: "facebook.com/epibrasil",
        endereco: "Av. Paulista, 2100 cj. 120 — Bela Vista, São Paulo/SP",
        snippet: "Luvas nitrílicas, capacetes e linha completa NR. Contrato anual com desconto.",
        rating: "4,5 · 210 avaliações",
        tags: ["epi", "luva", "nitrilica", "segurança", "sp"]
      },
      {
        id: "f5",
        nome: "Gás Industrial SP",
        site: "https://www.gasindustrialsp.fake.br",
        telefone: "(11) 2088-4400",
        whatsapp: "+55 11 96500-1188",
        instagram: "@gasindustrialsp",
        facebook: "facebook.com/gasindustrialsp",
        endereco: "Rua do Gás, 55 — Vila Galvão, Guarulhos/SP",
        snippet: "Argônio, CO₂ e misturas para solda. Troca de cilindros com logística própria.",
        rating: "4,4 · 61 avaliações",
        tags: ["gás", "argon", "solda", "co2", "cilindro"]
      },
      {
        id: "f6",
        nome: "LaserParts Óptica Industrial",
        site: "https://www.laserparts.fake.br",
        telefone: "(19) 3402-1188",
        whatsapp: "+55 19 98877-1122",
        instagram: "@laserparts.br",
        facebook: "facebook.com/laserparts",
        endereco: "Av. John Boyd Dunlop, 3200 — Campinas/SP",
        snippet: "Lentes e bicos para corte a laser fibra. Estoque técnico e suporte remoto.",
        rating: "4,9 · 38 avaliações",
        tags: ["laser", "lente", "corte", "fibra", "pecas"]
      },
      {
        id: "f7",
        nome: "FerroSul Laminados",
        site: "https://www.ferrosul.fake.br",
        telefone: "(11) 4567-1212",
        whatsapp: "+55 11 97331-5500",
        instagram: "@ferrosul.oficial",
        facebook: "facebook.com/ferrosul",
        endereco: "Av. do Estado, 5000 — Ipiranga, São Paulo/SP",
        snippet: "Laminados e perfis estruturais. Frete CIF para região metropolitana.",
        rating: "4,3 · 55 avaliações",
        tags: ["aço", "laminado", "perfil", "estrutural", "sp"]
      },
      {
        id: "f8",
        nome: "WeldCenter Arames e Fluxos",
        site: "https://www.weldcenter.fake.com",
        telefone: "(11) 2910-6677",
        whatsapp: "+55 11 95959-4040",
        instagram: "@weldcenter.sp",
        facebook: "facebook.com/weldcenter",
        endereco: "Rua Serra de Botucatu, 412 — Tatuapé, São Paulo/SP",
        snippet: "Linha completa de consumíveis para solda MIG/MAG e eletrodo revestido.",
        rating: "4,6 · 89 avaliações",
        tags: ["eletrodo", "arame", "solda", "mig", "e7018"]
      }
    ],
    cliente: [
      {
        id: "c1",
        nome: "Construtora Vale Azul S.A.",
        site: "https://www.valeazul.fake.br",
        telefone: "(11) 3088-1500",
        whatsapp: "+55 11 97710-2201",
        instagram: "@construtoravaleazul",
        facebook: "facebook.com/valeazulobras",
        endereco: "Av. Brigadeiro Faria Lima, 3500 — Itaim Bibi, São Paulo/SP",
        snippet: "Obras comerciais e industriais. Cliente ativo OP-4481 · estruturas metálicas.",
        rating: "Cliente A · 3 anos",
        tags: ["construtora", "estruturas", "obra", "sp", "vale", "azul"]
      },
      {
        id: "c2",
        nome: "Indústrias Rio Componentes",
        site: "https://www.industriasrio.fake.br",
        telefone: "(21) 2509-4400",
        whatsapp: "+55 21 98888-3300",
        instagram: "@industriasrio",
        facebook: "facebook.com/industriasrio",
        endereco: "Av. Brasil, 18900 — Ramos, Rio de Janeiro/RJ",
        snippet: "Compradora de grades e conjuntos soldados. OP-4490 em andamento.",
        rating: "Cliente A · 2 anos",
        tags: ["industria", "grades", "metalicas", "rio", "componentes"]
      },
      {
        id: "c3",
        nome: "Torre Norte Engenharia",
        site: "https://www.torrenorte.fake.br",
        telefone: "(11) 2440-7788",
        whatsapp: "+55 11 96161-7070",
        instagram: "@torrenorte.eng",
        facebook: "facebook.com/torrenorte",
        endereco: "Rua dos Canários, 120 — Jardim São Paulo, Guarulhos/SP",
        snippet: "RFQ aberta: 18 escadas marinheiro com corrimão · entrega dez/2026.",
        rating: "Prospect · quente",
        tags: ["escadas", "marinheiro", "engenharia", "guarulhos", "torre"]
      },
      {
        id: "c4",
        nome: "Galpões União Logística",
        site: "https://www.galpoesuniao.fake.br",
        telefone: "(11) 4208-9900",
        whatsapp: "+55 11 98484-1212",
        instagram: "@galpoesuniao",
        facebook: "facebook.com/galpoesuniao",
        endereco: "Rod. Anhanguera, km 28 — Osasco/SP",
        snippet: "Expansão de galpões. Lead marketing score 71 · qualificação comercial.",
        rating: "Lead · qualificação",
        tags: ["galpao", "logistica", "obra", "estruturas", "osasco"]
      },
      {
        id: "c5",
        nome: "Oficina Horizonte Mecânica",
        site: "https://www.oficinahorizonte.fake.br",
        telefone: "(11) 2977-3344",
        whatsapp: "+55 11 97272-8899",
        instagram: "@oficinahorizonte",
        facebook: "facebook.com/oficinahorizonte",
        endereco: "Rua Voluntários da Pátria, 780 — Santana, São Paulo/SP",
        snippet: "Título 4412 em atraso (R$ 22.400). Histórico de peças e reparos estruturais.",
        rating: "Cliente B · atraso 4d",
        tags: ["oficina", "mecanica", "pecas", "sp", "horizonte"]
      },
      {
        id: "c6",
        nome: "Portos do Sul Empreendimentos",
        site: "https://www.portosdosul.fake.br",
        telefone: "(13) 3222-1001",
        whatsapp: "+55 13 99191-4545",
        instagram: "@portosdosul",
        facebook: "facebook.com/portosdosul",
        endereco: "Av. Ana Costa, 455 — Gonzaga, Santos/SP",
        snippet: "Indicação comercial. Interesse em passarelas e estruturas portuárias.",
        rating: "Lead · contato inicial",
        tags: ["porto", "santos", "passarela", "estruturas", "empreendimento"]
      },
      {
        id: "c7",
        nome: "Obra Horizonte SP Incorporações",
        site: "https://www.obrahorizontesp.fake.br",
        telefone: "(11) 5188-2200",
        whatsapp: "+55 11 96666-3030",
        instagram: "@obrahorizontesp",
        facebook: "facebook.com/obrahorizontesp",
        endereco: "Alameda Santos, 1800 — Jardins, São Paulo/SP",
        snippet: "Lead de flyer da feira · score 82 · etapa proposta de estruturas.",
        rating: "Lead · proposta",
        tags: ["construtora", "obra", "horizonte", "estruturas", "sp", "feira"]
      },
      {
        id: "c8",
        nome: "MetalSul Montagens",
        site: "https://www.metalsul.fake.br",
        telefone: "(47) 3340-8800",
        whatsapp: "+55 47 98800-1122",
        instagram: "@metalsul.montagens",
        facebook: "facebook.com/metalsul",
        endereco: "Rua Blumenau, 2100 — Itajaí/SC",
        snippet: "Cliente e fornecedor cruzado. Compra OP-4472 e cobrança NF 8821.",
        rating: "Parceiro · 5 anos",
        tags: ["metal", "montagem", "sc", "estruturas", "metalsul"]
      }
    ]
  },

  relatorios: {
    oeeSemana: [86, 88, 84, 91, 89, 87, 89],
    dias: ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Hoje"],
    faturamentoMes: [
      { label: "Sem 1", valor: 420 },
      { label: "Sem 2", valor: 510 },
      { label: "Sem 3", valor: 465 },
      { label: "Sem 4", valor: 390 }
    ],
    qualidade: { aprovacao: 97.4, refugo: 1.8, retrabalho: 0.8 },
    entregas: { noPrazo: 92, atraso: 8 },
    topClientes: [
      { nome: "Construtora Vale Azul", share: 28 },
      { nome: "Indústrias Rio", share: 19 },
      { nome: "MetalSul", share: 14 },
      { nome: "Torre Norte", share: 11 }
    ]
  },

  marketing: {
    printGuia: "assets/marketing-print-almeida.jpg",
    campanhaAtiva: {
      nome: "Estruturas com precisão — Q4",
      canal: "Print + LinkedIn + e-mail B2B",
      status: "Em revisão",
      periodo: "24/11 a 15/12/2026",
      orcamento: 18500,
      gasto: 4200
    },
    pecas: [
      { tipo: "Flyer A4", status: "Aguardando aprovação do print", acao: "Aprovar arte do print" },
      { tipo: "E-mail blast clientes", status: "Rascunho pronto", acao: "Autorizar disparo do e-mail" },
      { tipo: "Post LinkedIn", status: "Agendável", acao: "Publicar post LinkedIn" },
      { tipo: "Catálogo PDF 8 pág.", status: "Em diagramação", acao: "Solicitar revisão ao estúdio" }
    ],
    leads: [
      { empresa: "Obra Horizonte SP", origem: "Flyer feira", score: 82, etapa: "Proposta" },
      { empresa: "Galpões União", origem: "LinkedIn", score: 71, etapa: "Qualificação" },
      { empresa: "Portos do Sul", origem: "Indicação", score: 64, etapa: "Contato inicial" }
    ],
    copyPost:
      "Na Metalúrgica Almeida, cada estrutura nasce com precisão industrial e prazo que o canteiro respeita. Conheça nosso portfólio Q4 — Guarulhos/SP."
  },

  pessoal: {
    headcount: 50,
    ferias: [
      { nome: "Carla Mota", setor: "Pintura", periodo: "01–15/12", status: "Aprovado" },
      { nome: "Diego Ramos", setor: "Expedição", periodo: "08–22/12", status: "Pendente autorização" }
    ],
    bancoHoras: [
      { nome: "Renata Silva", saldo: "+14h", limite: "40h" },
      { nome: "Júlio Mendes", saldo: "+9h", limite: "40h" },
      { nome: "Ana Paula Costa", saldo: "-3h", limite: "40h" }
    ],
    admissoes: [{ nome: "Lucas Prado", cargo: "Aux. Solda", data: "01/12/2026", status: "Documentação" }],
    desligamentos: [],
    beneficios: { vt: "Em dia", vr: "Crédito 25/11", planoSaude: "2 inclusões pendentes" },
    solicitacoes: [
      { id: "RH-221", tipo: "Adiantamento salarial", quem: "Bruno Ferreira", valor: 1200, acao: "Autorizar adiantamento" },
      { id: "RH-218", tipo: "Troca de turno", quem: "Pedro Nunes", valor: null, acao: "Autorizar troca de turno" },
      { id: "RH-215", tipo: "Férias Diego Ramos", quem: "Diego Ramos", valor: null, acao: "Aprovar férias" }
    ]
  },

  treinamento: {
    obrigatorios: [
      { nome: "NR-12 — Segurança em máquinas", vencimento: "05/12/2026", pendentes: 6, status: "Atenção" },
      { nome: "NR-35 — Trabalho em altura", vencimento: "18/01/2027", pendentes: 2, status: "Ok" },
      { nome: "Integração SST novos", vencimento: "Contínuo", pendentes: 1, status: "Ok" }
    ],
    agenda: [
      { data: "25/11", hora: "09:00", titulo: "Reciclagem solda MIG", local: "Sala Treinamento", vagas: "8/12" },
      { data: "27/11", hora: "14:00", titulo: "NR-12 teórica", local: "Auditório", vagas: "18/25" },
      { data: "02/12", hora: "08:30", titulo: "5S no almoxarifado", local: "Almox 1", vagas: "10/10" }
    ],
    colaboradores: [
      { nome: "Marcos Oliveira", curso: "NR-12", progresso: 40 },
      { nome: "Júlio Mendes", curso: "Solda MIG", progresso: 75 },
      { nome: "Lucas Prado", curso: "Integração SST", progresso: 10 },
      { nome: "Renata Silva", curso: "Liderança de turno", progresso: 90 }
    ]
  },

  notificacoes: [
    { id: "n1", tipo: "WhatsApp", titulo: "João — Aço Norte respondeu", detalhe: "Confirmação de bobinas amanhã 14h", hora: "08:12", lida: false, acao: "Abrir WhatsApp" },
    { id: "n2", tipo: "Estoque", titulo: "Eletrodo E7018 crítico", detalhe: "Abaixo de 20% do mínimo", hora: "07:05", lida: false, acao: "Abrir pedido de compra" },
    { id: "n3", tipo: "Produção", titulo: "Laser em manutenção", detalhe: "Retorno previsto 10:30", hora: "06:40", lida: false, acao: "Avisar supervisores" },
    { id: "n4", tipo: "Financeiro", titulo: "NF 8821 vence hoje", detalhe: "R$ 31.200 · MetalSul", hora: "07:45", lida: false, acao: "Agendar pagamento" },
    { id: "n5", tipo: "RH", titulo: "Adiantamento solicitado", detalhe: "Bruno Ferreira · R$ 1.200", hora: "08:20", lida: true, acao: "Revisar solicitação RH" },
    { id: "n6", tipo: "Marketing", titulo: "Print da campanha Q4", detalhe: "Arte pronta para aprovação", hora: "08:50", lida: false, acao: "Revisar print de marketing" },
    { id: "n7", tipo: "Treinamento", titulo: "NR-12 — 6 pendentes", detalhe: "Vencimento em 12 dias", hora: "ontem", lida: true, acao: "Convocar turma NR-12" },
    { id: "n8", tipo: "Compras", titulo: "SC-1044 aguarda aprovação", detalhe: "Soldamax · R$ 9.840", hora: "08:00", lida: false, acao: "Aprovar SC-1044" }
  ]
};
