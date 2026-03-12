import axios from "axios"

export async function webSearch(query) {

 try {

  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_redirect=1`

  const response = await axios.get(url, { timeout: 4000 })

  const data = response.data

  if (data.AbstractText && data.AbstractText.length > 20)
   return data.AbstractText

  if (data.RelatedTopics && data.RelatedTopics.length > 0)
   return data.RelatedTopics[0].Text

  return ""

 } catch (error) {

  console.log("web search error:", error.message)

  return ""

 }

}
