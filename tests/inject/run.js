// @ts-check
const {getLogger, levels: {DEBUG, INFO}} = require('log4js');
const karma = require('karma');
const path = require('path');
const {createEchoServer} = require('./echo-server');

const ECHO_SERVER_PORT = 9966;

process.env.NODE_OPTIONS = '--max_old_space_size=3072';

async function run() {
    const args = process.argv.slice(2);
    const debug = args.includes('--debug');

    // Default logger is not set if config file doesn't load, so config errors are swallowed
    getLogger().level = debug ? DEBUG : INFO;

    const karmaConfig = karma.config.parseConfig(path.join(__dirname, './karma.conf.js'), /** @type {any} */({debug}));

    const echoServer = await createEchoServer(ECHO_SERVER_PORT);
    const karmaServer = new karma.Server(/** @type {any} */(karmaConfig), () => {
        echoServer.close();
    });
    karmaServer.start();

    async function stop() {
        await /** @type {any} */(karmaServer).stop();
    }

    process.on('exit', stop);
    process.on('SIGINT', stop);
}

run();
