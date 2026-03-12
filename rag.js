import fs from "fs"

export async function searchDocs(query){

  const docs = JSON.parse(
    fs.readFileSync("./data/documents.json")
  )

  let results = []

  for(const doc of docs){

    if(doc.text.toLowerCase().includes(query.toLowerCase()))
      results.push(doc.text)

  }

  return results.join("\n")

}
