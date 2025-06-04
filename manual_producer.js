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
  await ch.assertQueue(config.calcQueue, { durable: false });
  await ch.assertQueue(config.broadcastQueue, { durable: false });

  while (true) {
    const op = await ask("Opération (add, sub, mul, div, all) : ");
    const n1 = parseFloat(await ask("Nombre 1 : "));
    const n2 = parseFloat(await ask("Nombre 2 : "));

    const msg = {
      op: op.trim(),
      n1,
      n2,
      requestId: uuidv4()
    };

    const queue = op === 'all' ? config.broadcastQueue : config.calcQueue;
    ch.sendToQueue(queue, Buffer.from(JSON.stringify(msg)));

    console.log('Message envoyé dans ${queue} :', msg);
    console.log('\n---\n');
  }
}

main();