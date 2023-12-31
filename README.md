# CLI para monitoramento de APIs

### Configs pré instalação
- Criar uma pasta onde será guardado o arquivo de configuração. Sugestão `api-mon`
- Dentro desta pasta, criar um arquivo `configs.js` com o seguinte conteúdo:
    ```js
        const ENVS = [
            {
                alias: 'alias', // Parâmetro usado para chamada dos serviços do ambiente
                envName: 'Ex de nome do ambiente',
                baseUrl: 'https://...',
                monitorPath: 'path-monitoramento' //ex: actuator/health, management/health
            },
            {
                alias: 'alias',
                envName: 'Ex de nome do ambiente',
                baseUrl: 'https://...',
                monitorPath: 'path-monitoramento' //ex: actuator/health, management/health
            }
        ];

        const TAGS = [
            {
                name: 'tag-A',
                services: [
                    'web-service-a-tag-a', 
                    'web-service-b-tag-a',
                    'web-service-c-tag-a',
                ]
            },
            {
                name: 'tag-B',
                services: [
                    'web-service-a-tag-b', 
                    'web-service-b-tag-b',
                ]
            },
            
        ];


        module.exports = { TAGS, ENVS };
    ```
- Configurar uma variável de ambiente com o nome `API_MON` apontando para a pasta onde o arquivo `configs.js` foi criado.

### Instalação global
Executar `npm i -g api-health-monitor` para instalar o projeto.

### Execução
Após a instalação global, executar `mon -help` em qualquer local, e seguir os passos descritos no helper.
