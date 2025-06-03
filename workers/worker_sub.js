const amqp = require('amqplib');
const config = require('../config');
const { sub } = require('../utils/math');

async function start() {
    const conn = await amqp.connect(config.rabbitUrl);
    const ch = await conn.createChannel();

    await ch.assertQueue(config.calcQueue, { durable: false });
    await ch.assertQueue(config.broadcastQueue, { durable: false });
    await ch.assertQueue(config.resultQueue, { durable: false });

    const handleMessage = async (msg) => {
        const data = JSON.parse(msg.content.toString());
        if (data.op !== 'sub' && data.op !== 'all') return ch.ack(msg);

        const result = {
            ...data,
            result: sub(data.n1, data.n2)
        };

        await new Promise(res => setTimeout(res, Math.random() * 10000 + 5000));
        ch.sendToQueue(config.resultQueue, Buffer.from(JSON.stringify(result)));
        console.log(`[✓] SUB Worker:`, result);
        ch.ack(msg);
    };

    ch.consume(config.calcQueue, handleMessage);
    ch.consume(config.broadcastQueue, handleMessage);
}

start().catch(console.error);
