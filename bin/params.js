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
const P_TAGS = {
    value: '-tags',
    helpText: 'List of tags as comma separated',
    type: 'string'
};
const P_DEBUG = {
    value: '-debug',
    helpText: 'Shows more information while running',
    type: 'boolean'
};

module.exports = {P_HELP, P_VERSION, P_SERVICE, P_TAGS, P_DEBUG};