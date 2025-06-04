const amqp = require('amqplib');
const config = require('../config');
const { div } = require('../utils/math');

async function start() {
    const conn = await amqp.connect(config.rabbitUrl);
    const ch = await conn.createChannel();

    // 1. Queues et exchange
    await ch.assertQueue(config.calcQueue, { durable: false });
    await ch.assertQueue(config.resultQueue, { durable: false });
    await ch.assertExchange('broadcast', 'fanout', { durable: false });

    // 2. Queue temporaire exclusive pour le broadcast
    const fanoutQueue = await ch.assertQueue('', { exclusive: true });
    await ch.bindQueue(fanoutQueue.queue, 'broadcast', '');

    // 3. Fonction de traitement
    const handleMessage = async (msg) => {
        const data = JSON.parse(msg.content.toString());

        // Ne traiter que les op 'div' (même si venant du fanout)
        if (data.op !== 'div' && data.op !== 'all') {
            ch.ack(msg);
            return;
        }

        const result = {
            ...data,
            result: div(data.n1, data.n2)
        };

        // Simule un calcul long (5 à 15 s)
        await new Promise(res => setTimeout(res, Math.random() * 10000 + 5000));
        ch.sendToQueue(config.resultQueue, Buffer.from(JSON.stringify(result)));
        console.log(`[✓] DIV Worker:`, result);
        ch.ack(msg);
    };

    // 4. Consommer depuis la queue directe et celle liée à l'exchange
    ch.consume(config.calcQueue, handleMessage, { noAck: false });
    ch.consume(fanoutQueue.queue, handleMessage, { noAck: false });

    console.log('[*] Worker DIV en attente...');
}

start().catch(console.error);
