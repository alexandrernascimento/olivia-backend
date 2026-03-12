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

  if (!results || results.length === 0) {
   return ""
  }

  const topResults = results.slice(0, 3)

  let text = "Resultados da internet:\n\n"

  topResults.forEach(r => {

   text += `Título: ${r.title}\n`
   text += `Resumo: ${r.snippet}\n`
   text += `Link: ${r.link}\n\n`

  })

  return text

 } catch (error) {

  console.log("web search error:", error.message)

  return ""

 }

}
