#! /usr/bin/env node
const https = require('https');

const versionInfo = require('../package').version;

const { P_HELP, P_VERSION, P_SERVICE, P_ENV, P_TAG, P_DEBUG } = require('./params');
const { ENVS, TAGS } = require(`${process.env.API_MON}/configs`);
const paramsList = process.argv.slice(2);
const GREETINGS = `To show the help information, type mon -help`;

let helpParam;
let versionParam;
let envParam;
let tagParam;
let serviceParam;
let debugParam;

const colRequestWidth = 70;
const colResponseWidth = 20;
const colReponseTimeWidth = 20;
const consoleWidth = colRequestWidth+colResponseWidth+colReponseTimeWidth;

handleParams(paramsList);

function handlePrintError(error, body, service) {

    if (body.includes('HTTP Status 404')) {
        return debugParam ? body : '404';
    } else if (body.includes('404 page not found')) {
        return debugParam ? body : '404';
    } else if (body.includes('Em manutenção')) {
        return debugParam ? body : 'OFF';
    } else if (body.includes('Bad Gateway')) {
        return debugParam ? body : 'Bad Gateway'
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
    if (debugParam) {
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
    const url = `${envParam.baseUrl}/${serviceName}/${envParam.monitorPath}`;
    
    if (debugParam) {
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
    |           $ mon -env=YOUR_ENV -service=SERVICE_NAME                                                             |
    |           $ mon -env=YOUR_ENV -tag=TAG                                                                          |
    |                                                                                                                 |
    |           Options:                                                                                              |
    |               ${P_HELP.value}             ${P_HELP.helpText}                                               [${P_HELP.type}]          |
    |               ${P_VERSION.value}          ${P_VERSION.helpText}                                     [${P_VERSION.type}]          |
    |               ${P_ENV.value}              ${P_ENV.helpText}                  [${P_ENV.type}]           |    
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
    |      Configs found:                                                                                             |
    |           Environments: ${ENVS.length}                                                                                       |
    |           Tags: ${TAGS.length}                                                                                               |
    |                                                                                                                 |
    |                                                                                                                 |
    ------------------------------------------------------------------------------------------------------------------
    `

    const doHelp = () => {
        helpParam = true;
        console.log(HELP_TEXT);
        //console.log('ENVS found:',ENVS);
        //console.log('TAGS found:',TAGS);
    }

    param.includes(P_HELP.value) ? doHelp() : null;
}

function handleVersionParam(param) {

    const showVersion = () => {
        versionParam = true;
        console.log(` Version: ${versionInfo}`);
    }

    param.includes(P_VERSION.value) ? showVersion() : null;

}

function handleServiceParam(param) {

    const setServiceFromParam = () => {
        serviceParam = param.split('=')[1];
    }

    param.includes(P_SERVICE.value) ? setServiceFromParam() : null;

}

function handleEnvParam(param) {

    const buildEnvInfos = () => {
        const envAlias = param.split('=')[1];
        envParam = ENVS.find(env => env.alias == envAlias);
    }

    param.includes(P_ENV.value) ? buildEnvInfos() : null;
}

function handleTagParam(param) {
    
    const setTagFromParam = () => {
        const tagName = param.split('=')[1];
        tagParam = TAGS.find(tag => tag.name == tagName)
    }

    param.includes(P_TAG.value) ? setTagFromParam() : null;

}

function handleDebugParam(param) {

    const activeDebug = () => {
        debugParam = true;
        console.log(' Debug mode active!');
        console.log(` Input params: ${paramsList}`);
        debugParam = true;
    }

    param.includes(P_DEBUG.value) ? activeDebug() : null;

}

async function check() {

    if (tagParam) {
        console.log(`--- Verificação iniciada em ${now()}`.padEnd(consoleWidth,'-'));
        console.log(`--- Request `.padEnd(colRequestWidth,'-')+` Response `.padEnd(colResponseWidth, '-')+` Response Time `.padEnd(colReponseTimeWidth, '-'));
        for (const service of tagParam.services) {
            await sendRequest(service);
        }
        console.log(`-`.padEnd(consoleWidth,'-'));
        console.log(`--- Verificação encerrada em ${now()}`.padEnd(consoleWidth,'-'));
    } else if (serviceParam) {
        console.log(`--- Request `.padEnd(colRequestWidth,'-')+` Response `.padEnd(colResponseWidth, '-')+` Response Time `.padEnd(colReponseTimeWidth, '-'));
        await sendRequest(serviceParam);
    } else if (!helpParam && !versionParam) {
        console.error('Params -tag or -service not found!');
    }
}

function handleParams(paramsList) {
    
    if (paramsList.length == 0) {
        console.info(GREETINGS);
        return;
    }

    paramsList.forEach(param => {
        handleHelpParam(param);
        handleDebugParam(param);
        handleVersionParam(param);
        handleEnvParam(param);
    });

    if (!envParam && !helpParam && !versionParam) {
        console.error('Param environment not found!');
        return;
    }

    paramsList.forEach(param => {
        handleTagParam(param);
        handleServiceParam(param);
    });

    check();

}


