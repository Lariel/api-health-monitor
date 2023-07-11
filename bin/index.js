#! /usr/bin/env node
const versionInfo = require('../package').version;

const P_HELP = '-help';
const P_VERSION = '-version';
const paramsList = process.argv.slice(2);
handleParams(paramsList);

function handleHelpParam(param) {

    const HELP_TEXT = `
    ------------------------------------------------------------------------------------------------------------------
    |   Help:                                                                                                         |
    |       Usage:                                                                                                    |
    |           Sintaxe geral: mon -service=SERVICE_NAME -tags=TAG1,TAG2,TAG3 -debug                                  |
    |                                                                                                                 |
    |           Options:                                                                                              |
    |               -help             Show this help                                               [boolean]          |
    |               -version          Show version information                                     [boolean]          |
    |               -service          The only required param is the service name to check         [string]           |
    |               -tags             List of tags as comma separated                              [string]           |
    |               -debug            Shows more information while running                         [boolean]          |
    |                                                                                                                 |
    |       General:                                                                                                  |
    |               Tags are used to create a logical grouping for monitoring different applications                  |
    |           who doesn't have, necessarily, any structural relations or interdependence. The use                   |
    |           case of this feature is to monitoring a set of services that is mainteined by the same                |
    |           team or squad.                                                                                        |
    |                                                                                                                 |
    |                                                                                                                 |
    |                                                                                                                 |
    ------------------------------------------------------------------------------------------------------------------
    `

    const doHelp = () => {
        paramHelp = true;
        console.log(HELP_TEXT);
    }

    param.includes(P_HELP) ? doHelp() : null;
}

function handleVersionParam(param) {

    const showVersion = () => {
        console.log(`Version: ${versionInfo}`);
    }

    param.includes(P_VERSION) ? showVersion() : null;

}


function handleParams(paramsList) {

    if (paramsList.length == 0) {
        const GREETINGS = `To show the help information, type mon -help`;
        console.log(GREETINGS);
    }

    paramsList.forEach(param => {
        handleHelpParam(param);
        handleVersionParam(param);
    });

}


