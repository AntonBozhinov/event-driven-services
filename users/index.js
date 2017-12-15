const app = require('express')();
const broker = require('message-broker');
const events = require('rabbit-events');
const Logger = require('logger');

const {messageBroker} = events;
const logger = new Logger('USER SERVICE');


broker.on(messageBroker.CONNECTING, console.log);

broker.connect('amqp://rabbitmq')

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.logI('START', `Server started at port ${PORT}`);
});