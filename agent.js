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
        "Busca informações atuais na internet. Use para notícias, eventos recentes, fatos atuais, pesquisas gerais, empresas, pessoas, lançamentos, tecnologia recente e quando a pergunta depender de dados externos ou atualizados.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Consulta de busca na internet."
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
        "Obtém clima e previsão do tempo para uma cidade. Use quando o usuário perguntar sobre temperatura, clima, chuva ou previsão.",
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
        "Obtém cotação entre moedas. Use para dólar, euro, real e outras moedas.",
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
        "Obtém preço atual de criptomoedas. Use para bitcoin, ethereum e outras criptos.",
      parameters: {
        type: "object",
        properties: {
          coin: {
            type: "string",
            description: "Nome da moeda na API. Ex.: bitcoin"
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
  return `
Você é a Olív-IA, assistente executiva inteligente da GNPW.

Seu objetivo é ajudar usuários respondendo perguntas com clareza,
precisão e profundidade sobre qualquer assunto.

Você pode usar:

- seu conhecimento geral
- informações fornecidas no contexto
- resultados de buscas externas quando disponíveis

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
        const result = await webSearch(args.query || "")
        return String(result || "")
      }

      case "getWeather": {
        const result = await getWeather(args.city || "Rio de Janeiro")
        return String(result || "")
      }

      case "getExchangeRate": {
        const result = await getExchangeRate(
          (args.base || "USD").toUpperCase(),
          (args.target || "BRL").toUpperCase()
        )
        return String(result || "")
      }

      case "getCryptoPrice": {
        const result = await getCryptoPrice(args.coin || "bitcoin")
        return String(result || "")
      }

      case "ragSearch": {
        const result = await ragSearch(args.query || "")
        return String(result || "")
      }

      default:
        return `Ferramenta desconhecida: ${toolName}`
    }
  } catch (error) {
    return `Erro ao executar ${toolName}: ${error.message}`
  }
}

export async function runAgent(message, session = "default") {
  const memory = getMemory(session)

  const messages = [
    {
      role: "system",
      content: buildSystemPrompt()
    },
    ...memory,
    {
      role: "user",
      content: message
    }
  ]

  // 1) Primeira chamada: o modelo decide se responde direto ou chama ferramenta
  const firstResponse = await openai.chat.completions.create({
    model: MODEL,
    messages,
    tools,
    tool_choice: "auto",
    temperature: 0.2
  })

  const firstMessage = firstResponse.choices?.[0]?.message

  // Se não chamou tools, responde direto
  if (!firstMessage?.tool_calls || firstMessage.tool_calls.length === 0) {
    const directReply =
      firstMessage?.content ||
      "Não consegui gerar uma resposta no momento."

    saveMemory(session, message, directReply)
    return directReply
  }

  // 2) Se chamou tools, adiciona a mensagem do assistente com os tool_calls
  const toolMessages = [...messages, firstMessage]

  // 3) Executa cada tool call e adiciona o retorno
  for (const toolCall of firstMessage.tool_calls) {
    const toolResult = await executeToolCall(toolCall)

    toolMessages.push({
      role: "tool",
      tool_call_id: toolCall.id,
      content: toolResult || "Sem resultados."
    })
  }

  // 4) Segunda chamada: o modelo usa os resultados das tools para responder ao usuário
  const finalResponse = await openai.chat.completions.create({
    model: MODEL,
    messages: toolMessages,
    temperature: 0.2
  })

  const finalReply =
    finalResponse.choices?.[0]?.message?.content ||
    "Não consegui gerar uma resposta no momento."

  saveMemory(session, message, finalReply)
  return finalReply
}
