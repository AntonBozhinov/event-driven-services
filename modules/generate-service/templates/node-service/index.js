const app = require('express')();
const broker = require('message-broker');
const Logger = require('logger');
const moduleExists = require('module-exists');
const events = require('app-events');

const { MessageBroker } = events;

const {SERVICE_READY} = MessageBroker;
const logger = new Logger('USER SERVICE');

broker.on(SERVICE_READY, () => {
    const PORT = process.env.PORT || 3000;

    if (moduleExists('./service')) {
        const service = require('./service');
        service(app, broker, events);
    } else {
        logger.logW('No Serice', 'No service found..');
    }

    app.listen(PORT, () => {
        logger.logI('START', `Server started at port ${PORT}`);
    });
});

broker.connect('amqp://localhost');

