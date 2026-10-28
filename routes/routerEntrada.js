const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
    model: 'entrada',
    idColumn: 'id_entrada',
    responseKey: 'entradas',
    columns: ['id_produto', 'id_fornecedor', 'quantidade', 'valor_unitario', 'data_entrada', 'observacao'],
    required: ['id_produto', 'id_fornecedor', 'quantidade', 'valor_unitario'],
    integerFields: ['id_produto', 'id_fornecedor', 'quantidade'],
    decimalFields: ['valor_unitario'],
    dateFields: ['data_entrada']
});