const app = require('express')();
const broker = require('message-broker');
const events = require('app-events');
const startService = require('./src'); // eslint-disable-line

const { MessageBroker } = events;

const { SERVICE_READY } = MessageBroker;

broker.on(SERVICE_READY, () => {
    startService();
});

broker.connect('amqp://localhost');

