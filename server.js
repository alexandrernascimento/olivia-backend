const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend da OLÍV-IA está online.");
});

app.post("/chat", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({
      error: "Mensagem não enviada"
    });
  }

  res.json({
    reply: "Olá. Eu sou a OLÍV-IA. Recebi sua pergunta: " + message
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Servidor rodando na porta " + PORT);
});
