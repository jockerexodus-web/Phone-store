// Stockage en mémoire (pour production, utilisez une DB comme Vercel KV ou Upstash)
// Note : en serverless, la mémoire n'est pas persistante entre les invocations.
// Pour un vrai usage, remplacez par Vercel KV / Upstash Redis.

const globalStore = globalThis.__numbersStore || (globalThis.__numbersStore = {
  numbers: {},   // { number: { createdAt } }
  codes: {},     // { number: [ { code, sender, timestamp } ] }
});

function generateVirtualNumber() {
  const prefixes = ['+33 6', '+33 7', '+1 555', '+44 7', '+49 15'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const part1 = String(Math.floor(Math.random() * 90) + 10);
  const part2 = String(Math.floor(Math.random() * 90) + 10);
  const part3 = String(Math.floor(Math.random() * 90) + 10);
  return `${prefix} ${part1} ${part2} ${part3}`;
}

export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // POST : génère un numéro OU reçoit un code (simulation)
  if (req.method === 'POST') {
    const { action, number, code, sender } = req.body || {};

    // --- Générer un nouveau numéro ---
    if (action === 'generate') {
      let newNumber;
      do {
        newNumber = generateVirtualNumber();
      } while (globalStore.numbers[newNumber]);

      globalStore.numbers[newNumber] = { createdAt: Date.now() };
      globalStore.codes[newNumber] = [];

      // Simule la réception de codes après quelques secondes
      simulateIncomingCodes(newNumber);

      return res.status(200).json({
        success: true,
        number: newNumber,
        expiresAt: Date.now() + 10 * 60 * 1000 // 10 min
      });
    }

    // --- Recevoir un code (webhook / API externe) ---
    if (action === 'receive' && number && code) {
      if (!globalStore.numbers[number]) {
        globalStore.numbers[number] = { createdAt: Date.now() };
        globalStore.codes[number] = [];
      }
      globalStore.codes[number].push({
        code,
        sender: sender || 'Service',
        timestamp: Date.now()
      });
      return res.status(200).json({ success: true });
    }

    return res.status(400).json({ error: 'Action invalide' });
  }

  // GET : récupère les codes d'un numéro
  if (req.method === 'GET') {
    const { number } = req.query;
    if (!number) return res.status(400).json({ error: 'Numéro requis' });

    return res.status(200).json({
      number,
      codes: globalStore.codes[number] || []
    });
  }

  return res.status(405).json({ error: 'Méthode non autorisée' });
}

// Simulation de codes entrants (pour la démo)
function simulateIncomingCodes(number) {
  const demoServices = [
    { sender: 'WhatsApp', code: () => String(Math.floor(Math.random() * 900000) + 100000) },
    { sender: 'Telegram', code: () => String(Math.floor(Math.random() * 90000) + 10000) },
    { sender: 'Google',   code: () => 'G-' + Math.floor(Math.random() * 900000 + 100000) },
    { sender: 'Amazon',   code: () => String(Math.floor(Math.random() * 9000) + 1000) }
  ];

  const delays = [3000, 7000, 12000];
  delays.forEach((delay, i) => {
    setTimeout(() => {
      const svc = demoServices[Math.floor(Math.random() * demoServices.length)];
      if (!globalStore.codes[number]) globalStore.codes[number] = [];
      globalStore.codes[number].push({
        code: svc.code(),
        sender: svc.sender,
        timestamp: Date.now()
      });
    }, delay);
  });
                    }
// Dans api/numbers.js, ajoutez :
if (action === 'twilio-webhook' && req.body.From && req.body.Body) {
  const code = req.body.Body.match(/\d{4,6}/)?.[0];
  if (code) {
    globalStore.codes[req.body.To]?.push({
      code,
      sender: req.body.From,
      timestamp: Date.now()
    });
  }
                    }
