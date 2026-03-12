import axios from "axios"

export async function webSearch(query) {

 try {

  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json`

  const response = await axios.get(url)

  const data = response.data

  if (data.AbstractText) return data.AbstractText

  if (data.RelatedTopics.length > 0) {

   return data.RelatedTopics[0].Text

  }

  return "Nenhum resultado relevante encontrado."

 } catch (error) {

  return "Erro ao consultar internet."

 }

}
