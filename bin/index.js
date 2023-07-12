#! /usr/bin/env node
const versionInfo = require('../package').version;
const { P_HELP, P_VERSION, P_SERVICE, P_TAGS, P_DEBUG } = require('./params');

const paramsList = process.argv.slice(2);
const GREETINGS = `To show the help information, type mon -help`;
const validParams = [];
handleParams(paramsList);

function handleHelpParam(param) {

    const HELP_TEXT = `
    ------------------------------------------------------------------------------------------------------------------
    |   Help:                                                                                                         |
    |       Usage:                                                                                                    |
    |           Sintaxe geral: mon -service=SERVICE_NAME -tags=TAG1,TAG2,TAG3 -debug                                  |
    |                                                                                                                 |
    |           Options:                                                                                              |
    |               ${P_HELP.value}             ${P_HELP.helpText}                                               [${P_HELP.type}]          |
    |               ${P_VERSION.value}          ${P_VERSION.helpText}                                     [${P_VERSION.type}]          |
    |               ${P_SERVICE.value}          ${P_SERVICE.helpText}         [${P_SERVICE.type}]           |
    |               ${P_TAGS.value}             ${P_TAGS.helpText}                              [${P_TAGS.type}]           |
    |               ${P_DEBUG.value}            ${P_DEBUG.helpText}                         [${P_DEBUG.type}]          |
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
        validParams.push(P_HELP.value);
        console.log(HELP_TEXT);
    }

    param.includes(P_HELP.value) ? doHelp() : null;
}

function handleVersionParam(param) {

    const showVersion = () => {
        validParams.push(P_VERSION.value);
        console.log(`Version: ${versionInfo}`);
    }

    param.includes(P_VERSION.value) ? showVersion() : null;

}

function handleServiceParam(param) {

    const doSomething = () => {
        validParams.push(P_SERVICE.value);
        console.log(P_SERVICE.value + ' works');
    }

    param.includes(P_SERVICE.value) ? doSomething() : null;

}

function handleTagsParam(param) {

    const doSomething = () => {
        validParams.push(P_TAGS.value);
        console.log(P_TAGS.value + ' works');
    }

    param.includes(P_TAGS.value) ? doSomething() : null;

}

function handleDebugParam(param) {

    const doSomething = () => {
        validParams.push(P_DEBUG.value);
        console.log(P_DEBUG.value + ' works');
    }

    param.includes(P_DEBUG.value) ? doSomething() : null;

}



function handleParams(paramsList) {

    paramsList.forEach(param => {
        handleHelpParam(param);
        handleVersionParam(param);
        handleServiceParam(param);
        handleTagsParam(param);
        handleDebugParam(param);
    });

    if (paramsList.length == 0 || validParams.length == 0) {
        console.log(GREETINGS);
    }

}


