const events = require('rabbit-events').messageBroker;
const Logger = require('logger');
const amqp = require('amqplib');

const logger = new Logger('Message Broker');

const { CONNECTING, CONNECTED, CHANNEL_CREATED } = events;

let counterConnection = 0;
let intervalConnection = 1000;
exports.handleConnection = function (connectionString) { // eslint-disable-line
    logger.logI('connect', `connecting to ${connectionString}`);
    const self = this;
    amqp.connect(connectionString)
        .then((conn) => {
            logger.logI('connect', 'connection received');
            self.connection = conn;
            self.emit(CONNECTED, conn);
        })
        .catch((err) => {
            if (counterConnection > 5) {
                logger.logE('connect', err.message);
                process.exit(1);
            }
            setTimeout(() => {
                counterConnection += 1;
                intervalConnection *= 2;
                if (counterConnection <= self.retryMax || 5) {
                    logger.logD(counterConnection, 'Error while trying to connect... Reconnecting');
                    self.emit(CONNECTING, connectionString);
                }
            }, intervalConnection);
        });
};

let counterChannel = 0;
let intervalChannel = 1000;
exports.createChannel = function(conn) { // eslint-disable-line
    const self = this;
    conn.createChannel
        .then((channel) => {
            this.channel = channel;
            logger.logI('channel', 'channel created...');
            this.emit(CHANNEL_CREATED, channel);
        })
        .catch((err) => {
            if (counterChannel > 5) {
                logger.logE('connect', err.message);
                process.exit(1);
            }
            setTimeout(() => {
                counterChannel += 1;
                intervalChannel *= 2;
                if (counterChannel <= self.retryMax || 5) {
                    logger.logD(counterConnection, 'Error while trying to connect... Reconnecting');
                    self.emit(CONNECTED, conn);
                }
            }, intervalChannel);
        });
};
