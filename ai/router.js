import { webSearch } from "./tools.js"
import { ragSearch } from "./rag.js"

export async function routeTools(message) {

 const text = message.toLowerCase()

 let context = ""

 if (

  text.includes("clima") ||
  text.includes("tempo") ||
  text.includes("previsão") ||
  text.includes("notícia") ||
  text.includes("hoje") ||
  text.includes("cotação") ||
  text.includes("preço")

 ) {

  const web = await webSearch(message)

  context += `Informação da internet:\n${web}\n\n`

 }

 const rag = await ragSearch(message)

 if (rag) {

  context += `Documentos internos:\n${rag}\n\n`

 }

 return context

}
