const app = require('express')();
const broker = require('message-broker');
const Logger = require('logger');
const events = require('app-events');
const startService = require('./service'); // eslint-disable-line

const { MessageBroker } = events;

const { SERVICE_READY } = MessageBroker;
const logger = new Logger('USER SERVICE');

broker.on(SERVICE_READY, () => {
    startService();
});

broker.connect('amqp://localhost');

