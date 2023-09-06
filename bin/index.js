#! /usr/bin/env node
const https = require('https');

const versionInfo = require('../package').version;
const { P_HELP, P_VERSION, P_SERVICE, P_TAG, P_DEBUG } = require('./params');
const tagListImported = require('./tags');

const paramsList = process.argv.slice(2);
const GREETINGS = `To show the help information, type mon -help`;
const validParams = [];
const baseUrl = '';
const monitorUrl = 'actuator/health';
let isDebuging = false;

handleParams(paramsList);


function handlePrintError(error, body, service) {

    if (body.includes('HTTP Status 404')) {
        return isDebuging ? body : '404';
    } else if (body.includes('404 page not found')) {
        return isDebuging ? body : '404';
    } else if (body.includes('Em manutenção')) {
        return isDebuging ? body : 'OFF';
    } else if (body.includes('Bad Gateway')) {
        return isDebuging ? body : 'Bad Gateway'
    } else {
        console.log('Falha no ',service);
        console.log('Error: ', error);
        console.log('Body: ', body);
    }
}

function printResponse(body, url, serviceName) {
    if (isDebuging) {
        console.log(` Resposta da request em ${url}`);
    }

    let status = '';
    
    try {
        status = JSON.parse(body).status;
    } catch (error) {
        status = 'DOWN -> '+handlePrintError(error, body, serviceName);
    }
   
    console.log(` ${serviceName}: ${status}`);
}

function sendRequest(serviceName) {
    const url = `${baseUrl}/${serviceName}/${monitorUrl}`;
    
    if (isDebuging) {
        console.log(` Verificando ${url}`);
    }
    return new Promise((resolve) => {
        https.get(
            url,
            res => {
                let body = '';
                res.on('data', function(chunk) {
                    body += chunk;
                });
                res.on('end', function() {
                    printResponse(body, url, serviceName);
                    resolve();
                });
            }
        );
    });
}

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
    |               ${P_SERVICE.value}          ${P_SERVICE.helpText}                                    [${P_SERVICE.type}]           |
    |               ${P_TAG.value}              ${P_TAG.helpText}                                                [${P_TAG.type}]           |
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
        console.log(` Version: ${versionInfo}`);
    }

    param.includes(P_VERSION.value) ? showVersion() : null;

}

function handleServiceParam(param) {

    const getServiceFromParam = () => {
        validParams.push(P_SERVICE.value);
        const service = param.split('=')[1];
        sendRequest(service);
    }

    param.includes(P_SERVICE.value) ? getServiceFromParam() : null;

}

function handleTagParam(param) {
    
    const doSomething = async () => {
        validParams.push(P_TAG.value);
        console.log(tagListImported);
        const tagName = param.split('=')[1];
        console.log(tagName);
        const tagParam = tagListImported.find(tag => tag.name == tagName)
        console.log(tagParam);
        for (const service of tagParam.services) {
            await sendRequest(service);
        }
    }

    param.includes(P_TAG.value) ? doSomething() : null;

}

function handleDebugParam(param) {

    const activeDebug = () => {
        validParams.push(P_DEBUG.value);
        console.log(' Debug mode active!');
        console.log(` Input params: ${paramsList}`);
        isDebuging = true;
    }

    param.includes(P_DEBUG.value) ? activeDebug() : null;

}



function handleParams(paramsList) {

    paramsList.forEach(param => {
        handleHelpParam(param);
        handleDebugParam(param);
        handleVersionParam(param);
        handleTagParam(param);
        handleServiceParam(param);
    });

    if (paramsList.length == 0 || validParams.length == 0) {
        console.log(GREETINGS);
    }

}


