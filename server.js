import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { runAgent } from "./agent.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

// Health check (útil para testar se o backend está online)
app.get("/", (req, res) => {
 res.json({
  status: "online",
  service: "Olív-IA Backend"
 })
})

app.post("/chat", async (req, res) => {

 try {

  const { message, session = "default" } = req.body

  // validação da requisição
  if (!message || message.trim() === "") {
   return res.status(400).json({
    reply: "Pergunta inválida."
   })
  }

  console.log("Pergunta recebida:", message)

  const reply = await runAgent(message, session)

  res.json({ reply })

 } catch (error) {

  console.error("ERRO NO AGENTE:", error)

  res.status(500).json({
   reply: "Erro interno da IA."
  })

 }

})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {

 console.log("===================================")
 console.log(" Olív-IA Backend iniciado ")
 console.log(" Porta:", PORT)
 console.log("===================================")

})
