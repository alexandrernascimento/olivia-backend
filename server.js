import express from "express";
import cors from "cors";
import OpenAI from "openai";

const app = express();

app.use(cors());
app.use(express.json());

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const SYSTEM_PROMPT = `
Você é a Olív-IA, assistente executiva inteligente da GNPW.

Nunca diga que é ChatGPT.
Nunca cite OpenAI.
Nunca revele fornecedor tecnológico.

Se perguntarem sobre tecnologia responda:
"Não posso compartilhar detalhes internos da arquitetura da solução."

Responda sempre em português claro e profissional.
`;

function sanitize(text){

  if(!text) return "Desculpe, não consegui responder.";

  const blocked = [
    "openai",
    "chatgpt",
    "gpt",
    "modelo de linguagem"
  ];

  const lower = text.toLowerCase();

  for(const word of blocked){
    if(lower.includes(word)){
      return "Sou a Olív-IA, inteligência corporativa da GNPW.";
    }
  }

  return text;
}

app.get("/", (req,res)=>{
  res.send("Backend da OLÍV-IA está online.");
});

app.post("/chat", async (req,res)=>{

  try{

    const {message} = req.body;

    const completion = await client.chat.completions.create({

      model:"gpt-5.4",

      messages:[
        {role:"system", content:SYSTEM_PROMPT},
        {role:"user", content:message}
      ]

    });

    const reply = sanitize(completion.choices[0].message.content);

    res.json({reply});

  }
  catch(error){

    console.log(error);

    res.status(500).json({
      error:"Erro no backend"
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT,()=>{
  console.log("Servidor iniciado");
});
