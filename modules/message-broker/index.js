const EventEmitter = require('events');
const Logger = require('logger');
const Ajv = require('ajv');
const path = require('path');
const events = require('./events');

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
    REGISTER_EVENT,
    DELETE_EVENT,
    UPDATE_EVENT,
} = events;

const logger = new Logger('Message Broker');

class MessageBroker extends EventEmitter {
    constructor(serviceName) {
        super();
        this.serviceName = serviceName || 'UNKNOWN';
        this.on(CONNECTING, handleConnection.bind(this));
        this.on(CONNECTED, createChannel.bind(this));
        this.on(PUBLISH, publish.bind(this));
        this.on(SUBSCRIBE, subscribe.bind(this));

        this.ajv = new Ajv();
        this.events = {};
        this.nativeEvents = events;
        this.nativeEventsArr = Object.keys(events).map(e => events[e]);
    }

    static getInstance() {
        if (!this.instance) {
            const pkgPath = path.resolve(process.cwd(), 'package.json');
            const pkg = require(`${pkgPath}`); // eslint-disable-line
            this.instance = new MessageBroker(pkg.name);
            return this.instance;
        }
        return this.instance;
    }

    emit(event, value) {
        logger.logEvent(this.serviceName, event, value);
        EventEmitter.prototype.emit.call(this, event, value);
    }

    validate(event, data, schema) {
        if (!this.nativeEventsArr.find(ne => ne === event)) {
            return this.ajv.validate(schema, data);
        }
        return true;
    }

    registerEvent(event, schema) {
        const parseJson = (jsonString) => {
            try {
                return JSON.parse(jsonString);
            } catch (err) {
                return jsonString;
            }
        };
        const parsedSchema = parseJson(schema);
        if (!this.events[event]) {
            this.events[event] = schema;
            return this.publish(REGISTER_EVENT, JSON.stringify({ event, schema: parsedSchema }));
        }
        return logger.logE('REGISTER EVENT', 'Event already registered');
    }

    deleteEvent(event) {
        if (this.events[event]) {
            delete this.events[event];
            return this.publish(DELETE_EVENT, event);
        }
        return logger.logE('DELETE EVENT', 'Event not found');
    }

    updateEvent(event, schema) {
        const parseJson = (jsonString) => {
            try {
                return JSON.parse(jsonString);
            } catch (err) {
                return jsonString;
            }
        };
        const parsedSchema = parseJson(schema);
        if (this.events[event]) {
            this.events[event] = schema;
            return this.publish(UPDATE_EVENT, JSON.stringify({ event, schema: parsedSchema }));
        }
        return logger.logE('UPDATE EVENT', 'Event not found');
    }

    connect(connectionString) {
        this.connectionString = connectionString;
        this.emit(CONNECTING, connectionString);
    }

    publish(event, msg, options = {}) {
        if (!this.connection) {
            logger.logD('publish', 'connection to message service lost... Trying to reconnect...');
            return this.emit(CONNECTING, this.connectionString);
        }

        if (!this.channel) {
            return this.emit(CONNECTED, this.connection);
        }

        if (
            (this.events[event] && this.validate(event, msg, this.events[event])) ||
            this.nativeEventsArr.find(ne => ne === event)
        ) {
            return this.emit(PUBLISH, { channelName: event, msg, options });
        }

        return logger.logE('PUBLISH', 'Event not registered');
    }

    subscribe(...channels) {
        if (!this.connection) {
            logger.logD('publish', 'connection to message service lost... Trying to reconnect...');
            return this.emit(CONNECTING, this.connectionString);
        }

        if (!this.channel) {
            return this.emit(CONNECTED, this.connection);
        }

        return this.emit(SUBSCRIBE, channels);
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
