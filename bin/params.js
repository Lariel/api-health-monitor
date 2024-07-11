const P_HELP = {
    value: '-help',
    helpText: 'Show this help',
    type: 'boolean'
};
const P_VERSION = {
    value: '-version',
    helpText: 'Show version information',
    type: 'boolean'
};
const P_SERVICE = {
    value: '-service',
    helpText: 'The service name to check',
    type: 'string'
};
const P_ENV = {
    value: '-env',
    helpText: 'Environment used to call requests',
    type: 'string'
};
const P_TAG = {
    value: '-tag',
    helpText: 'Tag to search',
    type: 'string'
};
const P_DEBUG = {
    value: '-debug',
    helpText: 'Shows more information while running',
    type: 'boolean'
};

module.exports = {P_HELP, P_VERSION, P_SERVICE, P_ENV, P_TAG, P_DEBUG};