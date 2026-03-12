import OpenAI from "openai"
import { getMemory, saveMemory } from "./memory.js"
import { webSearch, getExchangeRate, getCryptoPrice, getWeather } from "./tools.js"
import { ragSearch } from "./rag.js"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const MODEL = "gpt-4o"

const tools = [
  {
    type: "function",
    function: {
      name: "webSearch",
      description:
        "Busca informações atuais na internet. Use para notícias, fatos recentes, empresas, pessoas, tecnologia, eventos atuais e perguntas que dependam de dados externos ou atualizados.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Consulta para busca na internet."
          }
        },
        required: ["query"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getWeather",
      description:
        "Obtém clima atual ou previsão básica para uma cidade. Use quando o usuário perguntar sobre temperatura, clima, chuva ou previsão do tempo.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "Nome da cidade. Ex.: Rio de Janeiro"
          }
        },
        required: ["city"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getExchangeRate",
      description:
        "Obtém cotação atual entre moedas. Use para dólar, euro, real e outras moedas.",
      parameters: {
        type: "object",
        properties: {
          base: {
            type: "string",
            description: "Moeda base em código ISO. Ex.: USD"
          },
          target: {
            type: "string",
            description: "Moeda de destino em código ISO. Ex.: BRL"
          }
        },
        required: ["base", "target"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getCryptoPrice",
      description:
        "Obtém preço atual de criptomoedas. Use para bitcoin, ethereum e outras criptomoedas.",
      parameters: {
        type: "object",
        properties: {
          coin: {
            type: "string",
            description: "Nome da criptomoeda na API. Ex.: bitcoin"
          }
        },
        required: ["coin"],
        additionalProperties: false
      }
    }
  },
  {
    type: "function",
    function: {
      name: "ragSearch",
      description:
        "Consulta documentos internos da empresa. Use quando a pergunta parecer relacionada a informações internas, base de conhecimento, políticas, projetos ou contexto corporativo.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Pergunta a ser buscada nos documentos internos."
          }
        },
        required: ["query"],
        additionalProperties: false
      }
    }
  }
]

function buildSystemPrompt() {
  const now = new Date()

  const currentDate = now.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "America/Sao_Paulo"
  })

  const currentTime = now.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Sao_Paulo"
  })

  const currentYear = now.toLocaleDateString("pt-BR", {
    year: "numeric",
    timeZone: "America/Sao_Paulo"
  })

  return `
Você é a Olív-IA, assistente executiva inteligente da GNPW.

Data atual: ${currentDate}
Hora atual: ${currentTime}
Ano atual: ${currentYear}
Fuso horário de referência: America/Sao_Paulo

Use sempre a data e hora atuais acima como referência para:
- cálculos de idade
- prazos
- eventos atuais
- perguntas sobre "hoje", "agora", "esta semana", "este mês" ou "este ano"

Seu objetivo é ajudar usuários respondendo perguntas com clareza,
precisão e profundidade sobre qualquer assunto.

Você pode usar:
- seu conhecimento geral
- informações fornecidas no contexto
- resultados de buscas externas quando disponíveis
- documentos internos quando disponíveis

Nunca diga que seu conhecimento termina em 2023.

Se houver informações fornecidas no contexto da conversa,
utilize-as para gerar respostas atualizadas.

Se não houver dados externos disponíveis, responda usando seu conhecimento geral.

Regras de comportamento:
- Responda em português do Brasil.
- Para perguntas simples, responda diretamente.
- Para perguntas atuais, use ferramentas automaticamente quando necessário.
- Não invente dados em tempo real.
- Se a ferramenta retornar pouco contexto, seja honesta e responda com o melhor que houver.
- Quando a informação vier de ferramenta, priorize essa informação.
- Não diga que você não tem acesso à internet se a ferramenta estiver disponível.
- Não diga que seu treinamento vai até uma data específica.
- Se a pergunta puder ser respondida sem ferramenta, responda normalmente.
- Se a pergunta pedir clima, cotação, cripto, notícias ou fatos recentes, use ferramenta.
- Se a pergunta parecer interna à empresa, use ragSearch.
- Quando usar ferramenta, sintetize o resultado em uma resposta natural e útil.
- Em cálculos de idade, considere corretamente se a pessoa já fez aniversário no ano atual ou não.
`.trim()
}

function safeParseArgs(rawArgs) {
  try {
    return JSON.parse(rawArgs || "{}")
  } catch {
    return {}
  }
}

async function executeToolCall(toolCall) {
  const toolName = toolCall.function.name
  const args = safeParseArgs(toolCall.function.arguments)

  try {
    switch (toolName) {
      case "webSearch": {
        return String(await webSearch(args.query || "") || "")
      }

      case "getWeather": {
        return String(await getWeather(args.city || "Rio de Janeiro") || "")
      }

      case "getExchangeRate": {
        return String(
          await getExchangeRate(
            (args.base || "USD").toUpperCase(),
            (args.target || "BRL").toUpperCase()
          ) || ""
        )
      }

      case "getCryptoPrice": {
        return String(await getCryptoPrice(args.coin || "bitcoin") || "")
      }

      case "ragSearch": {
        return String(await ragSearch(args.query || "") || "")
      }

      default:
        return `Ferramenta desconhecida: ${toolName}`
    }
  } catch (error) {
    return `Erro ao executar ${toolName}: ${error.message}`
  }
}

export async function runAgent(message, session = "default") {
  const cleanMessage = String(message || "").trim()
  const memory = getMemory(session)

  const messages = [
    {
      role: "system",
      content: buildSystemPrompt()
    },
    ...memory,
    {
      role: "user",
      content: cleanMessage
    }
  ]

  const firstResponse = await openai.chat.completions.create({
    model: MODEL,
    messages,
    tools,
    tool_choice: "auto",
    temperature: 0.2
  })

  const firstMessage = firstResponse.choices?.[0]?.message

  if (!firstMessage?.tool_calls || firstMessage.tool_calls.length === 0) {
    const directReply =
      firstMessage?.content?.trim() ||
      "Não consegui gerar uma resposta no momento."

    saveMemory(session, cleanMessage, directReply)
    return directReply
  }

  const toolMessages = [...messages, firstMessage]

  for (const toolCall of firstMessage.tool_calls.slice(0, 5)) {
    const toolResult = await executeToolCall(toolCall)

    toolMessages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: toolResult || "Sem resultados."
    })
  }

  const finalResponse = await openai.chat.completions.create({
    model: MODEL,
    messages: toolMessages,
    temperature: 0.2
  })

  const finalReply =
    finalResponse.choices?.[0]?.message?.content?.trim() ||
    firstMessage?.content?.trim() ||
    "Não consegui gerar uma resposta no momento."

  saveMemory(session, cleanMessage, finalReply)
  return finalReply
}
