import fs from "fs"

export async function ragSearch(query) {

 const docs = JSON.parse(
  fs.readFileSync("./documents.json", "utf8")
 )

 const q = query.toLowerCase()

 const matches = docs.filter(doc =>
  doc.content.toLowerCase().includes(q)
 )

 if (matches.length === 0) return ""

 return matches
  .map(doc => doc.content)
  .join("\n")

}
