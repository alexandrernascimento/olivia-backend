import OpenAI from "openai"
import { getMemory, saveMemory } from "./memory.js"
import { webSearch } from "./tools.js"
import { ragSearch } from "./rag.js"

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY
})

export async function runAgent(message, session) {

 const memory = getMemory(session)

 let context = ""

 const text = message.toLowerCase()

 if (
  text.includes("clima") ||
  text.includes("tempo") ||
  text.includes("previsão") ||
  text.includes("notícia") ||
  text.includes("hoje")
 ) {

  const web = await webSearch(message)

  context += `Informações atualizadas da internet:\n${web}\n\n`

 }

 const rag = await ragSearch(message)

 if (rag) {

  context += `Documentos internos:\n${rag}\n\n`

 }

 const messages = [

  {
   role: "system",
   content: `
Você é a Olív-IA, assistente executiva inteligente da GNPW.

Seu papel é:

- responder perguntas com profundidade
- analisar informações
- auxiliar decisões estratégicas
- usar informações externas quando necessário
`
  },

  ...memory,

  {
   role: "user",
   content: `
Pergunta:

${message}

Contexto adicional:

${context}
`
  }

 ]

 const completion = await openai.chat.completions.create({

  model: "gpt-4o",
  messages,
  temperature: 0.3

 })

 const reply = completion.choices[0].message.content

 saveMemory(session, message, reply)

 return reply

}
