import fs from "fs"

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 2)
}

export async function ragSearch(query) {
  try {
    const docs = JSON.parse(fs.readFileSync("./documents.json", "utf8"))
    const queryTokens = tokenize(query)

    if (queryTokens.length === 0) return ""

    const scoredDocs = docs
      .map(doc => {
        const content = `${doc.title} ${doc.content}`
        const docTokens = tokenize(content)

        let score = 0

        for (const token of queryTokens) {
          if (docTokens.includes(token)) {
            score += 1
          }
        }

        return {
          title: doc.title,
          content: doc.content,
          score
        }
      })
      .filter(doc => doc.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)

    if (scoredDocs.length === 0) return ""

    return scoredDocs
      .map(doc => `Título: ${doc.title}\nConteúdo: ${doc.content}`)
      .join("\n\n")
  } catch (error) {
    console.log("Erro no RAG:", error.message)
    return ""
  }
}
