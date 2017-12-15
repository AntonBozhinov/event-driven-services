const {labels, theme} = require('./constants');
const colors = require('colors/safe');

const {blue, cyan, red, green, grey, yellow, bgGreen, black} = colors;

class Logger {
    constructor(serviceName) {
        this.serviceName = serviceName;
    }

    logD(tag, message) {
        if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development') {
            console.log(`[${colors.blue(labels.DEBUG)}][${cyan(this.serviceName)}][${grey(tag)}]: ${message}`);
        }
    }
    
    logE(tag, message) {
        console.error(`[${red(labels.ERROR)}][${cyan(this.serviceName)}][${grey(tag)}]: ${message}`);
    }

    logI(tag, message) {
        console.info(`[${cyan(labels.INFO)}][${cyan(this.serviceName)}][${grey(tag)}]: ${message}`);
    }

    logW(tag, message) {
        console.warn(`[${yellow(labels.WARNING)}][${cyan(this.serviceName)}][${grey(tag)}]: ${message}`);
    }

    logEvent(event, message) {
        console.info(`[${green(labels.EVENT)}][${green(event)}]:`, message);
    }
}

module.exports = Logger;