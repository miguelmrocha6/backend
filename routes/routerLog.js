const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
    model: 'log',
    idColumn: 'id_login',
    responseKey: 'logs',
    columns: ['usuarios', 'tabela_afetada', 'acao', 'registro', 'data_hora'],
    integerFields: ['registro'],
    dateFields: ['data_hora']
});