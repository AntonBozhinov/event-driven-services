const broker = require('message-broker'); // eslint-disable-line
const service = require('./src');
const Logger = require('logger'); // eslint-disable-line

const logger = new Logger('event-registry');
const { SERVICE_READY, REGISTER_EVENT, ADD_LISTENER } = broker.nativeEvents;
const parseContent = msg => JSON.parse(msg.content.toString());

const regisnterEventHandler = (data) => {
    logger.logI('REGISTER EVENT', parseContent(data));
};
const addListenerHandler = (data) => {
    logger.logI('ADD LISTENER', parseContent(data));
};

broker.subscribe(REGISTER_EVENT, ADD_LISTENER);

broker.on(REGISTER_EVENT, regisnterEventHandler);
broker.on(ADD_LISTENER, addListenerHandler);
broker.on(SERVICE_READY, service);

broker.connect('amqp://localhost');

