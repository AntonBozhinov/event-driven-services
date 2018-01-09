const EventEmitter = require('events');
const events = require('app-events').MessageBroker;
const Logger = require('logger');

const {
    handleConnection,
    createChannel,
    publish,
    subscribe,
} = require('./lib/actions');

const {
    CONNECTING,
    CONNECTED,
    PUBLISH,
    SUBSCRIBE,
} = events;

const logger = new Logger('Message Broker');

class MessageBroker extends EventEmitter {
    constructor() {
        super();
        this.on(CONNECTING, handleConnection.bind(this));
        this.on(CONNECTED, createChannel.bind(this));
        this.on(PUBLISH, publish.bind(this));
        this.on(SUBSCRIBE, subscribe.bind(this));
    }

    static getInstance() {
        if (!this.instance) {
            this.instance = new MessageBroker();
            return this.instance;
        }
        return this.instance;
    }

    emit(event, value) {
        logger.logEvent(event, value);
        EventEmitter.prototype.emit.call(this, event, value);
    }

    connect(connectionString) {
        this.connectionString = connectionString;
        this.emit(CONNECTING, connectionString);
    }

    publish(channelName, msg) {
        if (!this.connection) {
            logger.logD('publish', 'connection to message service lost... Trying to reconnect...');
            return this.emit(CONNECTING, this.connectionString);
        }

        if (!this.channel) {
            return this.emit(CONNECTED, this.connection);
        }

        return this.emit(PUBLISH, { channelName, msg });
    }

    subscribe(channel) {
        if (!this.connection) {
            logger.logD('publish', 'connection to message service lost... Trying to reconnect...');
            return this.emit(CONNECTING, this.connectionString);
        }

        if (!this.channel) {
            return this.emit(CONNECTED, this.connection);
        }

        return this.emit(SUBSCRIBE, channel);
    }
    when(eventArray, next) {
        const self = this;
        const fulfilled = new Array(eventArray.length);
        const result = {};
        eventArray.forEach((event, index) => {
            const handler = (msg) => {
                result[event] = msg;
                fulfilled[index] = true;
                for (let i = 0; i < fulfilled.length; i++) {
                    if (!fulfilled[i]) {
                        return false;
                    }
                }
                return next(result);
            };
            self.on(event, handler);
        });
    }
}

module.exports = MessageBroker.getInstance();
