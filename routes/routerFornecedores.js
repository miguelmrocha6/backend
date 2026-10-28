const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
    model: 'fornecedor',
    idColumn: 'id_fornecedor',
    responseKey: 'fornecedores',
    columns: ['nome', 'empresa', 'email', 'telefone', 'cidade', 'estado', 'ativo'],
    required: ['nome'],
    booleanFields: ['ativo']
});