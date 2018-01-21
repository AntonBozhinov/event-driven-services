const broker = require('message-broker'); // eslint-disable-line
const service = require('./src');

const { SERVICE_READY } = broker.nativeEvents;

broker.on(SERVICE_READY, () => {
    service();
});

broker.connect('amqp://localhost');

