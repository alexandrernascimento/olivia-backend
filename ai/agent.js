import OpenAI from "openai"
import { getMemory, saveMemory } from "./memory.js"
import { routeTools } from "./router.js"

const openai = new OpenAI({
 apiKey: process.env.OPENAI_API_KEY
})

export async function runAgent(message, session) {

 const memory = getMemory(session)

 const toolContext = await routeTools(message)

 const messages = [

  {
   role: "system",
   content: `
Você é a Olív-IA, assistente executiva inteligente da GNPW.

Seu papel é:

- responder perguntas com profundidade
- analisar informações
- auxiliar decisões
- combinar conhecimento interno e externo

Sempre entregue respostas completas e claras.
`
  },

  ...memory,

  {
   role: "user",
   content: `
Pergunta do usuário:

${message}

Informações adicionais:

${toolContext}
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
