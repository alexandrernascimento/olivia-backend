import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { runAgent } from "./ai/agent.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.post("/chat", async (req, res) => {

 const { message, session = "default" } = req.body

 try {

  const reply = await runAgent(message, session)

  res.json({ reply })

 } catch (error) {

  console.error(error)

  res.status(500).json({
   reply: "Erro ao processar pergunta."
  })

 }

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {

 console.log(`Olív-IA backend rodando na porta ${PORT}`)

})
