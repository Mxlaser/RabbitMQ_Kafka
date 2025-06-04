const amqp = require('amqplib');
const readline = require('readline');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  const conn = await amqp.connect(config.rabbitUrl);
  const ch = await conn.createChannel();

  // 1️⃣ Déclaration de la queue pour opérations ciblées
  await ch.assertQueue(config.calcQueue, { durable: false });

  // 2️⃣ Déclaration de l’exchange de type fanout pour "all"
  const fanoutExchange = 'broadcast';
  await ch.assertExchange(fanoutExchange, 'fanout', { durable: false });

  while (true) {
    const op = (await ask("Opération (add, sub, mul, div, all) : ")).trim();
    const n1 = parseFloat(await ask("Nombre 1 : "));
    const n2 = parseFloat(await ask("Nombre 2 : "));

    const msg = {
      op,
      n1,
      n2,
      requestId: uuidv4()
    };

    if (op === 'all') {
      // 3️⃣ Envoie du message vers l’exchange fanout
      ch.publish(fanoutExchange, '', Buffer.from(JSON.stringify(msg)));
      console.log(`[x] Envoyé à l'exchange '${fanoutExchange}' :`, msg);
    } else {
      // 4️⃣ Envoie classique vers la queue directe
      ch.sendToQueue(config.calcQueue, Buffer.from(JSON.stringify(msg)));
      console.log(`[x] Envoyé à la queue '${config.calcQueue}' :`, msg);
    }

    console.log('\n---\n');
  }
}

main();
