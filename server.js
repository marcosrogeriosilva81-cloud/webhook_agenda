// server.js
const express = require('express');
const axios = require('axios');

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
    console.log('Webhook verificado com sucesso');
    res.status(200).send(challenge);
  } else {
    console.error('Falha na verificação do webhook:', { mode, token: token ? 'presente' : 'ausente' });
    res.sendStatus(403);
  }
});

app.post('/webhook', (req, res) => {
  // Resposta imediata de ACK
  res.status(200).json({ status: 'received' });

  // Encaminhamento assíncrono
  if (N8N_WEBHOOK_URL) {
    axios.post(N8N_WEBHOOK_URL, req.body, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000  // 10s timeout para evitar travamentos
    })
    .then(() => console.log('Payload encaminhado para n8n com sucesso'))
    .catch((error) => {
      if (error.code === 'ECONNABORTED') {
        console.error('Timeout no encaminhamento para n8n');
      } else {
        console.error('Erro ao encaminhar para n8n:', error.message);
      }
    });
  } else {
    console.warn('N8N_WEBHOOK_URL não definida, pulando encaminhamento');
  }
});

// Health check opcional para Render
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'whatsapp-bridge' });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// package.json
{
  "name": "whatsapp-meta-bridge",
  "version": "1.0.0",
  "description": "Ponte de webhook para WhatsApp/Meta -> n8n",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0"
  },
  "engines": {
    "node": ">=18.0.0"
  },
  "author": "",
  "license": "MIT"
}

// README.md (snippet para copiar no repositório)
## Variáveis de Ambiente no Render

Configure no dashboard do Render:

- `PORT`: Automático (Render define).
- `VERIFY_TOKEN`: Token secreto exato do Meta Developers.
- `N8N_WEBHOOK_URL`: URL do webhook do n8n (ex: https://seu-n8n.app/webhook/abc).

## Configuração no Meta Developers (WhatsApp API)

- **Callback URL**: `https://webhook-agenda.onrender.com/webhook` (substitua pelo seu domínio Render).
- **Verify Token**: Deve coincidir **exatamente** com `VERIFY_TOKEN`.

## Deploy no Render

1. Crie um novo Web Service no Render.
2. Conecte ao GitHub com `server.js` e `package.json`.
3. Defina as env vars.
4. Build Command: `npm install`.
5. Start Command: `npm start`.

O servidor responde ACK imediato no POST para evitar timeouts do Meta e encaminha assincronamente para n8n.
