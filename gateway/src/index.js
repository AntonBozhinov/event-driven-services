const app = require('express')();
const broker = require('message-broker');
const events = require('events');
const Logger = require('logger');

const logger = new Logger('GATEWAY')
module.exports = () => {
    // write your code here
    app.use('/user', require('./routes/user_management'));
    const PORT = process.env.PORT || 3000
    app.listen(PORT, () => {
        logger.logI('STARTED AT PORT', PORT)
    })
};
