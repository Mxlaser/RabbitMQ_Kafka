const amqp = require('amqplib');
const config = require('../config');
const { div } = require('../utils/math');

// ... même structure

const handleMessage = async (msg) => {
  const data = JSON.parse(msg.content.toString());
  if (data.op !== 'div' && data.op !== 'all') return ch.ack(msg);

  const result = {
    ...data,
    result: div(data.n1, data.n2)
  };

  await new Promise(res => setTimeout(res, Math.random() * 10000 + 5000));
  ch.sendToQueue(config.resultQueue, Buffer.from(JSON.stringify(result)));
  console.log(`[✓] DIV Worker:`, result);
  ch.ack(msg);
};
