const amqp = require('amqplib');
const config = require('../config');
const { add } = require('../utils/math');

async function start() {
    const conn = await amqp.connect(config.rabbitUrl);
    const ch = await conn.createChannel();

    await ch.assertQueue(config.calcQueue, { durable: false });
    await ch.assertQueue(config.resultQueue, { durable: false });
    await ch.assertExchange('broadcast', 'fanout', { durable: false });

    const fanoutQueue = await ch.assertQueue('', { exclusive: true });
    await ch.bindQueue(fanoutQueue.queue, 'broadcast', '');

    const handleMessage = async (msg) => {
        const data = JSON.parse(msg.content.toString());

        if (data.op !== 'add' && data.op !== 'all') {
            ch.ack(msg);
            return;
        }

        const result = {
            ...data,
            result: add(data.n1, data.n2)
        };

        await new Promise(res => setTimeout(res, Math.random() * 10000 + 5000));
        ch.sendToQueue(config.resultQueue, Buffer.from(JSON.stringify(result)));
        console.log(`[✓] ADD Worker:`, result);
        ch.ack(msg);
    };

    ch.consume(config.calcQueue, handleMessage, { noAck: false });
    ch.consume(fanoutQueue.queue, handleMessage, { noAck: false });

    console.log('[*] Worker ADD en attente...');
}

start().catch(console.error);
