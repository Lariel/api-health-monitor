#! /usr/bin/env node
const https = require('https');

const versionInfo = require('../package').version;

const { P_HELP, P_VERSION, P_SERVICE, P_ENV, P_TAG, P_DEBUG } = require('./params');
const { ENVS, TAGS } = require(`${process.env.API_MON}/configs`);
const paramsList = process.argv.slice(2);
const GREETINGS = `To show the help information, type mon -help`;
const INVALID_PARAMS = `Invalid params.`;

let helpParam;
let versionParam;
let envParam;
let tagParam;
let serviceParam;
let debugParam;

let totalRequests = 0;
let totalSuccessRequests = 0;
let totalFailedRequests = 0;

let colRequestWidth = 75;
let colResponseWidth = 20;
let colReponseTimeWidth = 20;
let consoleWidth = colRequestWidth+colResponseWidth+colReponseTimeWidth;

handleParams(paramsList);

function handlePrintError(error, body, service) {
    totalFailedRequests++;

    if (error == 500) {
        return debugParam ? `${error} ${JSON.parse(body).error}`: '';
    } else if (body.includes('HTTP Status 404')) {
        return debugParam ? '-> 404' : '';
    } else if (body.includes('404 page not found')) {
        return debugParam ? '-> 404' : '';
    } else if (body.includes('Em manutenção')) {
        return debugParam ? '-> OFF' : '';
    } else if (body.includes('Bad Gateway')) {
        return debugParam ? '-> Bad Gateway' : '';
    } else if (error == 'DOWN') {
        return debugParam ? '-> DOWN' : '';
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

function calcPercentSuccess() {
    if (debugParam) {
        console.log(`${totalSuccessRequests} sucessos obtidos, e ${totalFailedRequests} erros, de um total de ${totalRequests} requests.`);
    }

    return `${Math.round((totalSuccessRequests/totalRequests)*100)}%`;
}

function printResponse(body, url, serviceName, responseTime) {
    totalRequests++;

    let status = '';
    
    try {
        status = JSON.parse(body).status;
        if (status == 'UP') {
            totalSuccessRequests++;
        } else {
            status = `DOWN ${handlePrintError(status, body, serviceName)}`;
        }
    } catch (error) {
        status = `DOWN ${handlePrintError(error, body, serviceName)}`;
    }

    const logLine = `| ${url}`.padEnd(colRequestWidth-1,' ')+`|   ${status}`.padEnd(colResponseWidth, ' ')+`|    ${responseTime} ms`.padEnd(colReponseTimeWidth, ' ')+'|';
    console.log(logLine);
}

function sendRequest(serviceName) {
    const url = `${envParam.baseUrl}/${serviceName}/${envParam.monitorPath}`;
    
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
    |           $ mon -service=SERVICE_NAME                                                                           |
    |           $ mon -env=YOUR_ENV -tag=TAG                                                                          |
    |                                                                                                                 |
    |           Options:                                                                                              |
    |               ${P_HELP.value}             ${P_HELP.helpText}                                               [${P_HELP.type}]          |
    |               ${P_VERSION.value}          ${P_VERSION.helpText}                                     [${P_VERSION.type}]          |
    |               ${P_ENV.value}              ${P_ENV.helpText}                            [${P_ENV.type}]           |    
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
    if (debugParam) {console.log(`handleEnvParam ${param}`)};

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
    }

    param.includes(P_DEBUG.value) ? activeDebug() : null;

}

async function check() {

    if (tagParam) {
        if (debugParam) {console.log('Rodando com tagParam ',tagParam)};
        console.log(`--- Verificação iniciada em ${now()}`.padEnd(consoleWidth,'-'));
        console.log(`--- Request `.padEnd(colRequestWidth,'-')+` Response `.padEnd(colResponseWidth, '-')+` Response Time `.padEnd(colReponseTimeWidth, '-'));
        for (const service of tagParam.services) {
            await sendRequest(service);
        }
        console.log(`-`.padEnd(consoleWidth,'-'));
        console.log(`--- Verificação encerrada em ${now()} com ${calcPercentSuccess()} de sucesso `.padEnd(consoleWidth,'-'));
    } else if (serviceParam && envParam) {
        if (debugParam) {console.log(`Rodando com serviceParam ${serviceParam} e envParam ${envParam}`)};
        console.log(`--- Request `.padEnd(colRequestWidth,'-')+` Response `.padEnd(colResponseWidth, '-')+` Response Time `.padEnd(colReponseTimeWidth, '-'));
        await sendRequest(serviceParam);
    } else if (serviceParam && !envParam) {
        if (debugParam) {console.log(`Rodando com serviceParam ${serviceParam} e envParam ${envParam}`)};
        console.log(`--- Request `.padEnd(colRequestWidth,'-')+` Response `.padEnd(colResponseWidth, '-')+` Response Time `.padEnd(colReponseTimeWidth, '-'));
        for (const env of ENVS) {
            handleEnvParam(`${P_ENV.value}=${env.alias}`)
            await sendRequest(serviceParam);
        }
        console.log(`-`.padEnd(consoleWidth,'-'));
        console.log(`--- Verificação encerrada em ${now()} com ${calcPercentSuccess()} de sucesso `.padEnd(consoleWidth,'-'));
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
        handleTagParam(param);
        handleServiceParam(param);
    });

    if (((!envParam && !serviceParam) || (tagParam && serviceParam)) 
        && !helpParam && !versionParam) {
        console.error(INVALID_PARAMS +GREETINGS);
        return;
    }

    check();

}
