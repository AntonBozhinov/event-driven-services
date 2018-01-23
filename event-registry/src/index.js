const app = require('express')();
const broker = require('message-broker'); // eslint-disable-line
const Logger = require('logger'); // eslint-disable-line

const logger = new Logger('event-registry');


module.exports = () => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        logger.logI('server started on port:', PORT);
    });
};
