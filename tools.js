import OpenAI from "openai"

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function searchWeb(query){

  const result = await client.responses.create({

    model:"gpt-4o",

    tools:[{type:"web_search_preview"}],

    input:query

  })

  return result.output_text

}
