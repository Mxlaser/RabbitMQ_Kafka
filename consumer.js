const amqp = require('amqplib');
const config = require('./config');

    async function consume() {
    const conn = await amqp.connect(config.rabbitUrl);
    const ch = await conn.createChannel();

    await ch.assertQueue(config.resultQueue, { durable: false });

    ch.consume(config.resultQueue, (msg) => {
        const data = JSON.parse(msg.content.toString());
        console.log(`[=] Result received:`, data);
        ch.ack(msg);
    });
}

consume().catch(console.error);
