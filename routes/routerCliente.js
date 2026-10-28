const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
    model: 'cliente',
    idColumn: 'id_cliente',
    responseKey: 'clientes',
    columns: ['nome', 'email', 'contato', 'ativo'],
    required: ['nome', 'email'],
    booleanFields: ['ativo']
});