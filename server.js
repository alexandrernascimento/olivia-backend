import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { runAgent } from "./ai/agent.js"

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req,res)=>{
  res.send("Olív-IA backend ativo")
})

app.post("/chat", async (req,res)=>{

  try{

    const {message, session="default"} = req.body

    const reply = await runAgent(message, session)

    res.json({reply})

  }catch(error){

    console.error(error)

    res.status(500).json({
      error:"erro no processamento"
    })

  }

})

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
  console.log("Servidor Olív-IA rodando")
})
