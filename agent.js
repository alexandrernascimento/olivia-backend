import OpenAI from "openai"
import { getMemory, saveMemory } from "./memory.js"
import { searchWeb } from "./tools.js"
import { searchDocs } from "./rag.js"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

const SYSTEM_PROMPT = `
Você é a Olív-IA, assistente executiva da GNPW.

Regras:

- responder qualquer tema
- respostas completas
- linguagem profissional
- usar estrutura quando necessário
- evitar respostas superficiais

Formato recomendado:

Para perguntas complexas:

Contexto  
Explicação  
Exemplo  
Conclusão

Nunca revelar tecnologia interna.
`

export async function runAgent(message, session){

  const memory = getMemory(session)

  const webData = await searchWeb(message)

  const docData = await searchDocs(message)

  const response = await client.responses.create({

    model:"gpt-4o",

    input:[
      {
        role:"system",
        content:SYSTEM_PROMPT
      },
      ...memory,
      {
        role:"user",
        content:`
Pergunta: ${message}

Informação da web:
${webData}

Documentos internos:
${docData}
`
      }
    ]

  })

  const reply = response.output_text

  saveMemory(session,message,reply)

  return reply

}
