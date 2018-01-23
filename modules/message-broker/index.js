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
    sync,
} = require('./lib/actions');

const {
    CONNECTING,
    CONNECTED,
    PUBLISH,
    SUBSCRIBE,
    REGISTER_EVENT,
    DELETE_EVENT,
    UPDATE_EVENT,
    ADD_LISTENER,
    SERVICE_READY,
} = events;

const logger = new Logger('Message Broker');

class MessageBroker extends EventEmitter {
    constructor(serviceName) {
        super();
        this.serviceName = serviceName || 'UNKNOWN';
        this.ajv = new Ajv();
        this.events = {};
        this.eventCache = [];
        this.subscribtionsCache = [];
        this.nativeEvents = events;
        this.nativeEventsArr = Object.keys(events).map(e => events[e]);

        this.on(CONNECTING, handleConnection.bind(this));
        this.on(CONNECTED, createChannel.bind(this));
        this.on(PUBLISH, publish.bind(this));
        this.on(SUBSCRIBE, subscribe.bind(this));
        this.on(SERVICE_READY, sync.bind(this));
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
        if (event === PUBLISH) {
            logger.logEvent(this.serviceName, event, value.msg);
        } else {
            logger.logEvent(this.serviceName, event, value);
        }
        EventEmitter.prototype.emit.call(this, event, value);
    }

    on(event, listener, description) {
        logger.logListener(this.serviceName, event, listener.name);
        this.publish(ADD_LISTENER, JSON.stringify({
            service: this.serviceName,
            event,
            listener: listener.name,
            description,
        }));
        EventEmitter.prototype.on.call(this, event, listener);
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
        if (!this.events[event.name]) {
            this.events[event.name] = schema;
            return this.publish(REGISTER_EVENT, JSON.stringify({ ...event, schema: parsedSchema }));
        }
        return logger.logE('REGISTER EVENT', 'Event already registered');
    }

    deleteEvent(eventName) {
        if (this.events[eventName]) {
            delete this.events[eventName];
            return this.publish(DELETE_EVENT, eventName);
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
        if (this.events[event.name]) {
            this.events[event.name] = schema;
            return this.publish(UPDATE_EVENT, JSON.stringify({ ...event, schema: parsedSchema }));
        }
        return logger.logE('UPDATE EVENT', 'Event not found');
    }

    connect(connectionString) {
        this.connectionString = connectionString;
        this.emit(CONNECTING, connectionString);
    }

    publish(event, msg, options = {}) {
        if (!this.connection || !this.channel) {
            logger.logW('PUBLISH', 'No connection to message service. Events will be cached and send on service ready');
            // event cache storage limit
            if (!(this.eventCache.length > 1000)) {
                return this.eventCache.push({ event, msg, options });
            }
            const errMsg = `Maximum event cache exceeded. Please connect ${this.serviceName} to a messaging service`;
            logger.logE('PUBLISH', errMsg);
            throw new Error(errMsg);
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
        if (!this.connection || !this.channel) {
            logger.logW('SUBSCRIBE', 'No connection to message service. Subscribitions will be cached and send on service ready');
            // subscribtionsCache cache storage limit
            if (!(this.subscribtionsCache.length > 1000)) {
                this.subscribtionsCache = this.subscribtionsCache.concat(channels);
                return this.subscribtionsCache;
            }
            const errMsg = `Maximum subscribition cache exceeded. Please connect ${this.serviceName} to a messaging service`;
            logger.logE('SUBSCRIBE', errMsg);
            throw new Error(errMsg);
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
