import axios from "axios"

const SERPER_KEY = process.env.SERPER_API_KEY

export async function webSearch(query) {

 try {

  const response = await axios.post(
   "https://google.serper.dev/search",
   { q: query },
   {
    headers: {
     "X-API-KEY": SERPER_KEY,
     "Content-Type": "application/json"
    }
   }
  )

  const results = response.data.organic

  if (!results) return ""

  const topResults = results.slice(0, 5)

  let text = ""

  topResults.forEach(r => {

   text += `
Título: ${r.title}
Resumo: ${r.snippet}
Fonte: ${r.link}

`

  })

  return text

 } catch (error) {

  console.log("Erro web search:", error.message)

  return ""

 }

}
