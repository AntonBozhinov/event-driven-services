const app = require('express')();
const broker = require('message-broker');
const events = require('events');
const Logger = require('logger');

module.exports = () => {
    broker.subscribe('service.user_management.user.get.init')
    broker.on('service.user_management.user.get.init', (params) => {
        broker.publish('service.user_management.user.get.complete', params.content.toString(), { correlationId: params.properties.correlationId})
    })
};
