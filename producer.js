const amqp = require('amqplib');
const { randomInt } = require('crypto');
const { v4: uuidv4 } = require('uuid');
const config = require('./config');

const operations = ['add', 'sub', 'mul', 'div', 'all'];

async function run() {
    const conn = await amqp.connect(config.rabbitUrl);
    const ch = await conn.createChannel();

    await ch.assertQueue(config.calcQueue, { durable: false });
    await ch.assertQueue(config.broadcastQueue, { durable: false });

    setInterval(() => {
        const n1 = randomInt(1, 100);
        const n2 = randomInt(1, 100);
        const op = operations[randomInt(0, operations.length)];
        const message = {
            n1,
            n2,
            op,
            requestId: uuidv4()
        };

        const queue = op === 'all' ? config.broadcastQueue : config.calcQueue;
        ch.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
        console.log(`[x] Sent to ${queue}:`, message);
    }, 5000);
}

run().catch(console.error);
