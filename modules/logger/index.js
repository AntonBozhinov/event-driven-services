const {labels, theme} = require('./constants');
const colors = require('colors/safe');
const os = require('os');

const {blue, cyan, red, green, grey, yellow, black, magenta, bgWhite} = colors;

class Logger {
    constructor(serviceName) {
        this.serviceName = serviceName;
        this.hostname = os.hostname()
    }

    logD(tag, message) {
        if (process.env.NODE_ENV === 'dev' || process.env.NODE_ENV === 'development') {
            console.log(`${grey(new Date())} [${colors.blue(labels.DEBUG)}][${magenta(this.hostname)}][${cyan(this.serviceName)}][${grey(tag)}]: ${message}`);
        }
    }
    
    logE(tag, message) {
        console.error(`${grey(new Date())} [${red(labels.ERROR)}][${magenta(this.hostname)}][${cyan(this.serviceName)}][${grey(tag)}]: ${message}`);
    }

    logI(tag, message) {
        console.info(`${grey(new Date())} [${cyan(labels.INFO)}][${magenta(this.hostname)}][${cyan(this.serviceName)}][${grey(tag)}]: ${message}`);
    }

    logW(tag, message) {
        console.warn(`${grey(new Date())} [${yellow(labels.WARNING)}][${magenta(this.hostname)}][${cyan(this.serviceName)}][${grey(tag)}]: ${message}`);
    }

    logEvent(event, message) {
        console.info(`${grey(new Date())} [${green(labels.EVENT)}][${magenta(this.hostname)}][${green(event)}]:`, message);
    }
}

module.exports = Logger;