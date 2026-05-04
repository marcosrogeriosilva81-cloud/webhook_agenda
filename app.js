const express = require('express');
const app = express();

app.use(express.json());

const port = process.env.PORT || 3000;
const verifyToken = process.env.VERIFY_TOKEN;

// ✅ Rota de teste (browser)
app.get('/', (req, res) => {
  res.status(200).send('API rodando 🚀');
});

// ✅ Verificação do webhook (Meta)
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('WEBHOOK VERIFIED');
    return res.status(200).send(challenge);
  }

  res.sendStatus(403);
});

// ✅ Recebimento de mensagens
app.post('/webhook', (req, res) => {
  console.log('Webhook recebido:');
  console.log(JSON.stringify(req.body, null, 2));

  res.sendStatus(200);
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
