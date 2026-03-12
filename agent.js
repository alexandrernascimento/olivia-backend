import OpenAI from "openai"
import { getMemory, saveMemory } from "./memory.js"
import { webSearch } from "./tools.js"

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY
})

export async function runAgent(message, session = "default") {

 const memory = getMemory(session)

 const messages = [
  {
   role: "system",
   content: `
Você é a Olív-IA, assistente executiva inteligente da GNPW.

Responda perguntas sobre qualquer assunto com clareza e profundidade.

Se a pergunta exigir informações atuais (notícias, clima, preços, eventos recentes),
solicite a ferramenta "webSearch".
`
  },

  ...memory,

  {
   role: "user",
   content: message
  }
 ]

 // PRIMEIRA RESPOSTA DO MODELO
 const completion = await openai.chat.completions.create({
  model: "gpt-4o",
  messages,
  temperature: 0.3
 })

 let reply = completion.choices[0].message.content

 // DETECTAR SE PRECISA BUSCAR INTERNET
 const realtimeKeywords = [
  "hoje",
  "agora",
  "clima",
  "tempo",
  "previsão",
  "cotação",
  "dólar",
  "bitcoin",
  "notícia",
  "últimas",
  "preço"
 ]

 const needsWebSearch = realtimeKeywords.some(word =>
  message.toLowerCase().includes(word)
 )

 if (needsWebSearch) {

  const webResults = await webSearch(message)

  const secondCompletion = await openai.chat.completions.create({
   model: "gpt-4o",
   messages: [
    ...messages,
    {
     role: "system",
     content: `Informações atualizadas encontradas na internet:\n${webResults}`
    }
   ]
  })

  reply = secondCompletion.choices[0].message.content

 }

 saveMemory(session, message, reply)

 return reply

}
