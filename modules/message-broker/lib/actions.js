const events = require('../events');
const Logger = require('logger');
const amqp = require('amqplib');

const logger = new Logger('Message Broker');

const {
    CONNECTING, CONNECTED, CHANNEL_CREATED, SERVICE_READY,
} = events;

exports.handleConnection = (function () {
    let counter = 0;
    let interval = 1000;
    return function (connectionString) { // eslint-disable-line
        logger.logI('connect', `connecting to ${connectionString}`);
        const self = this;
        amqp.connect(connectionString)
            .then((conn) => {
                logger.logI('connect', 'connection received');
                self.connection = conn;
                self.emit(CONNECTED, conn);
            })
            .catch((err) => {
                if (counter > 3) {
                    logger.logE('connect', err.message);
                    process.exit(1);
                }
                setTimeout(() => {
                    counter += 1;
                    interval *= 2;
                    if (counter <= self.retryMax || 3) {
                        logger.logD(counter, 'Error while trying to connect... Reconnecting');
                        self.emit(CONNECTING, connectionString);
                    }
                }, interval);
            });
    };
}());

exports.createChannel = (function () {
    let counter = 0;
    let interval = 1000;
    return function (conn) {
        logger.logI('connected', 'creating channel');
        const self = this;
        conn.createChannel()
            .then((channel) => {
                self.channel = channel;
                logger.logI('channel', 'channel created...');
                self.emit(CHANNEL_CREATED, channel);
                self.emit(SERVICE_READY, self);
            })
            .catch((err) => {
                if (counter > this.retryChannelMax || 3) {
                    logger.logE('connect', err.message);
                    process.exit(1);
                }
                setTimeout(() => {
                    counter += 1;
                    interval *= 2;
                    if (counter <= self.retryMax || 3) {
                        logger.logD(counter, 'Error while trying to connect... Reconnecting');
                        self.emit(CONNECTED, conn);
                    }
                }, interval);
            });
    };
}());

exports.publish = function ({ channelName, msg, options }) {
    const exchange = channelName.split('.').shift();
    const topic = channelName.split('.').length > 1 ? channelName.split('.').slice(1).join('.') : '#';
    this.channel.assertExchange(exchange, 'topic', { durable: true });
    this.channel.publish(exchange, topic, Buffer.from(msg), { ...options, persistent: true });
};

exports.subscribe = function (channels) {
    channels.forEach((channelName) => {
        const exchange = channelName.split('.').shift();
        const topic = channelName.split('.').length > 1 ? channelName.split('.').slice(1).join('.') : '#';
        this.channel.assertExchange(exchange, 'topic', { durable: true });
        this.channel.assertQueue('', { exclusive: true })
            .then((q) => {
                const handleMessage = (msg) => {
                    this.emit(channelName, msg);
                    this.channel.ack(msg);
                };
                this.channel.bindQueue(q.queue, exchange, topic);
                this.channel.consume(q.queue, handleMessage);
            })
            .catch((err) => {
                logger.logE('subscribe', `Unable to subscrive to channel: ${channelName}`);
                console.error(err); // eslint-disable-line
            });
    });
};
