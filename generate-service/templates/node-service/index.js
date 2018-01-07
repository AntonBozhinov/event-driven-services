const app = require('express')();
const broker = require('message-broker');
const Logger = require('logger');
const events = require('app-events');
const service = require('./service'); // eslint-disable-line

const { MessageBroker } = events;

const { SERVICE_READY } = MessageBroker;
const logger = new Logger('USER SERVICE');

broker.on(SERVICE_READY, () => {
    const PORT = process.env.PORT || 3000;
    service(app, broker, events);
    app.listen(PORT, () => {
        logger.logI('START', `Server started at port ${PORT}`);
    });
});

broker.connect('amqp://localhost');

