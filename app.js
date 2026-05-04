const express = require('express');
const axios = require('axios'); // precisa adicionar no package.json
const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// URL do webhook do n8n
const N8N_WEBHOOK_URL = "https://augmented-elongated-yard.ngrok-free.dev/webhook-test/82e278a1-e3dc-4bf6-b215-6bb760ec5f52/whatsapp-retorno";

// Verificação Meta
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

// Recebe mensagem do WhatsApp
app.post('/webhook', async (req, res) => {
  console.log("Recebido da Meta:", JSON.stringify(req.body, null, 2));

  try {
    // Envia para o n8n
    await axios.post(N8N_WEBHOOK_URL, req.body);
  } catch (error) {
    console.error("Erro ao enviar para n8n:", error.message);
  }

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
