#! /usr/bin/env node
const https = require('https');

const versionInfo = require('../package').version;
const { P_HELP, P_VERSION, P_SERVICE, P_TAG, P_DEBUG } = require('./params');
const { ENV, TAGS } = require(`${process.env.API_MON}/configs`);
const paramsList = process.argv.slice(2);
const GREETINGS = `To show the help information, type mon -help`;
const validParams = [];
const baseUrl = `${ENV.baseUrl}`;
const monitorPath = `${ENV.monitorPath}`;

const colRequestWidth = 70;
const colResponseWidth = 20;
const colReponseTimeWidth = 20;
const tableWidth = colRequestWidth+colResponseWidth+colReponseTimeWidth;

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

function now() {
    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    const timestamp = date.getTime();
    const time = new Date(timestamp).toLocaleTimeString('pt-BR');

    return `${day}-${month}-${year} às ${time}`;
}

function calcResponseTime(start, end) {
    return end-start;
}

function printResponse(body, url, serviceName, responseTime) {
    if (isDebuging) {
        console.log(` Resposta da request em ${url}`);
    }

    let status = '';
    
    try {
        status = JSON.parse(body).status;
    } catch (error) {
        status = 'DOWN -> '+handlePrintError(error, body, serviceName);
    }

    const logLine = `| ${url}`.padEnd(colRequestWidth-1,' ')+`|   ${status}`.padEnd(colResponseWidth, ' ')+`|    ${responseTime} ms`.padEnd(colReponseTimeWidth, ' ')+'|';
    console.log(logLine);
}

function sendRequest(serviceName) {
    const url = `${baseUrl}/${serviceName}/${monitorPath}`;
    
    if (isDebuging) {
        console.log(` Verificando ${url}`);
    }
    const startTimestamp = new Date().getTime();
    return new Promise((resolve) => {
        https.get(
            url,
            res => {
                let body = '';
                res.on('data', function(chunk) {
                    body += chunk;
                });
                res.on('end', function() {
                    const endTimestamp = new Date().getTime();
                    printResponse(body, url, serviceName, calcResponseTime(startTimestamp,endTimestamp));
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
    |           $ mon -service=SERVICE_NAME                                                                           |
    |           $ mon -tag=TAG                                                                                        |
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

    const getServiceFromParam = async () => {
        validParams.push(P_SERVICE.value);
        const service = param.split('=')[1];
        console.log(`--- Request `.padEnd(colRequestWidth,'-')+` Response `.padEnd(colResponseWidth, '-')+` Response Time `.padEnd(colReponseTimeWidth, '-'));
        await sendRequest(service);
    }

    param.includes(P_SERVICE.value) ? getServiceFromParam() : null;

}

function handleTagParam(param) {
    
    const doSomething = async () => {
        validParams.push(P_TAG.value);
        //console.log(TAGS);
        const tagName = param.split('=')[1];
        //console.log(tagName);
        const tagParam = TAGS.find(tag => tag.name == tagName)
        //console.log(tagParam);
        
        console.log(`--- Verificação iniciada em ${now()}`.padEnd(tableWidth,'-'));
        console.log(`--- Request `.padEnd(colRequestWidth,'-')+` Response `.padEnd(colResponseWidth, '-')+` Response Time `.padEnd(colReponseTimeWidth, '-'));
        for (const service of tagParam.services) {
            await sendRequest(service);
        }
        console.log(`-`.padEnd(tableWidth,'-'));
        console.log(`--- Verificação encerrada em ${now()}`.padEnd(tableWidth,'-'));
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
    });

    paramsList.forEach(param => {
        handleTagParam(param);
        handleServiceParam(param);
    });

    if (paramsList.length == 0 || validParams.length == 0) {
        console.log(GREETINGS);
    }

}


