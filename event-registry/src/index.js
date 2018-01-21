const app = require('express')();
const broker = require('message-broker'); // eslint-disable-line
const Logger = require('logger'); // eslint-disable-line
const redis = require('redis');

const logger = new Logger('event-registry');

module.exports = () => {
    const PORT = process.env.PORT || 3000;
    const { REDIS_HOST, REDIS_PORT } = process.env;
    const { REGISTER_EVENT } = broker.nativeEvents;

    const client = redis.createClient(REDIS_PORT || 6379, REDIS_HOST);

    client.on('error', (err) => {
        logger.logE('REDIS_ERROR', err);
    });

    broker.subscribe(REGISTER_EVENT);
    broker.on(REGISTER_EVENT, () => {
    });
    app.listen(PORT, () => {
        logger.logI('server started on port:', PORT);
    });
};
