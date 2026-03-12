import OpenAI from "openai"
import { getMemory, saveMemory } from "./memory.js"
import { webSearch } from "./tools.js"
import { ragSearch } from "./rag.js"

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY
})

export async function runAgent(message, session = "default") {

 const memory = getMemory(session)

 let context = ""

 const text = message.toLowerCase()

 // WEB SEARCH COM PROTEÇÃO
 try {

  if (
   text.includes("tempo") ||
   text.includes("clima") ||
   text.includes("previsão") ||
   text.includes("notícia") ||
   text.includes("hoje")
  ) {

   const web = await webSearch(message)

   if (web) {
    context += `Informação da internet:\n${web}\n\n`
   }

  }

 } catch (err) {

  console.log("Erro web search:", err)

 }

 // RAG COM PROTEÇÃO
 try {

  const rag = await ragSearch(message)

  if (rag) {

   context += `Documentos internos:\n${rag}\n\n`

  }

 } catch (err) {

  console.log("Erro rag:", err)

 }

 const messages = [

  {
   role: "system",
   content: `
Você é a Olív-IA, assistente executiva inteligente da GNPW.

Responda sempre de forma clara, direta e útil.

Se a pergunta for simples, responda diretamente.
Não diga que precisa de mais contexto.
`
  },

  ...memory,

  {
   role: "user",
   content: `
Pergunta:

${message}

Contexto:

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
