window.DONA_MARTA_DATA = {
  empresa: {
    nome: "Metalúrgica Almeida",
    responsavel: "Carlos Almeida"
  },

  avisos: [
    {
      tom: "red",
      titulo: "Estoque crítico — Eletrodos E7018",
      texto: "18% do mínimo. Risco de parar a linha 3 amanhã."
    },
    {
      tom: "amber",
      titulo: "NF 8821 vence hoje",
      texto: "R$ 31.200 · MetalSul · até 17h"
    }
  ],

  categorias: [
    {
      id: "estoque",
      nome: "Estoque",
      tom: "orange",
      itens: [
        "Eletrodos E7018 abaixo do mínimo",
        "Bobina SAE 1020: 8,4 ton (mín. 10)",
        "Sugestão: pedir 300 kg à Soldamax"
      ]
    },
    {
      id: "clientes",
      nome: "Clientes",
      tom: "green",
      itens: [
        "Vale Azul: recebimento R$ 126.500 às 14h",
        "WhatsApp Aço Norte aguardando resposta",
        "RFQ Torre Norte: 18 escadas marinheiro"
      ]
    },
    {
      id: "compras",
      nome: "Compras",
      tom: "blue",
      itens: [
        "Cotação eletrodos: Soldamax vs WeldCenter",
        "Pedido luvas nitrílicas — aprovar",
        "Lente laser: pedido enviado"
      ]
    },
    {
      id: "pessoal",
      nome: "Pessoal",
      tom: "purple",
      itens: [
        "2 faltas justificadas na produção",
        "NR-12 vence em 11 dias",
        "Adiantamento Bruno Ferreira pendente"
      ]
    },
    {
      id: "financeiro",
      nome: "Financeiro",
      tom: "teal",
      itens: [
        "A pagar hoje: R$ 48.700",
        "Entrada prevista Vale Azul: R$ 126.500",
        "Título 4412 em atraso (4 dias)"
      ]
    }
  ],

  playScript: [
    {
      overlay: "Aqui o empresário não precisa saber de IA. Ele só conversa.",
      wait: 2200,
      action: "clear"
    },
    {
      overlay: "A Dona Marta organiza o operacional do dia a dia.",
      wait: 1800,
      action: "marta",
      text: "Bom dia, Carlos! Resumo de hoje na Metalúrgica Almeida:\n• 2 avisos urgentes (estoque e NF)\n• Recebimento Vale Azul R$ 126.500 às 14h\n• Linha 3 coberta, eletrodos no limite\n\nQuer que eu cuide de algo agora?"
    },
    {
      overlay: null,
      wait: 2600,
      action: "user",
      text: "Preciso achar clientes para uma campanha"
    },
    {
      overlay: "Ela entende o pedido em linguagem natural — sem menu, sem planilha.",
      wait: 2200,
      action: "marta",
      text: "Perfeito. Posso montar uma lista quente com obra Horizonte, Galpões União e Portos do Sul — leads que já pediram estrutura este mês. Quer que eu prepare o rascunho da campanha Q4?"
    },
    {
      overlay: "Upload direto no chat, igual WhatsApp.",
      wait: 1600,
      action: "upload",
      name: "leads-campanha-q4.xlsx"
    },
    {
      overlay: null,
      wait: 1800,
      action: "user",
      text: "Onde envio essas informações?"
    },
    {
      overlay: "Tudo acontece com autorização. Ele mantém o controle.",
      wait: 2000,
      action: "auth",
      title: "Organizar arquivo na pasta Campanha Q4",
      detail: "A Dona Marta vai classificar leads-campanha-q4.xlsx em Marketing → Campanhas e avisar o time comercial."
    },
    {
      overlay: "Sem login em 10 sistemas. Uma conversa resolve.",
      wait: 2000,
      action: "marta",
      text: "Arquivo salvo em Marketing → Campanhas Q4. Já cruzei com os 3 leads quentes e deixei o rascunho de e-mail pronto para sua revisão."
    },
    {
      overlay: "Ela antecipa risco operacional — não só responde perguntas.",
      wait: 1800,
      action: "marta",
      text: "⚠️ Alerta: eletrodos E7018 em 18% do mínimo.\nSugestão: Soldamax — R$ 32,80/kg, entrega em 24h.\nQuer que eu monte o pedido de 300 kg?"
    },
    {
      overlay: null,
      wait: 1600,
      action: "user",
      text: "Sim, monta o pedido"
    },
    {
      overlay: "Tudo acontece com autorização. Ele mantém o controle.",
      wait: 1800,
      action: "auth",
      title: "Criar pedido de compra — Soldamax",
      detail: "300 kg Eletrodo E7018 3,25mm · R$ 9.840 · prazo 24h"
    },
    {
      overlay: null,
      wait: 1800,
      action: "marta",
      text: "Pedido #PC-441 enviado à Soldamax. Te aviso quando a NF antecipada chegar."
    },
    {
      overlay: "Também responde o cliente por você — sempre com o seu ok.",
      wait: 1800,
      action: "marta",
      text: "📩 João (Aço Norte) perguntou se confirma o recebimento das bobinas amanhã 14h.\n\nSugestão de resposta:\n“Confirmado o recebimento amanhã 14h na planta Guarulhos. Por favor envie a NF antecipada.”\n\nAutorizo o envio?"
    },
    {
      overlay: null,
      wait: 1400,
      action: "auth",
      title: "Enviar WhatsApp para Aço Norte",
      detail: "Resposta sugerida sobre recebimento das bobinas amanhã às 14h."
    },
    {
      overlay: "Secretária de IA para o dono que não é técnico.",
      wait: 2400,
      action: "marta",
      text: "Mensagem enviada ao João. Tudo atualizado no seu dia — estoque, campanha e cliente."
    },
    {
      overlay: "Dona Marta: a empresa fala. Ela executa.",
      wait: 2800,
      action: "end"
    }
  ]
};
