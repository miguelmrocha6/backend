const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
    model: 'saida',
    idColumn: 'id_saida',
    responseKey: 'saidas',
    columns: ['id_produto', 'id_funcionario', 'quantidade', 'valor_unitario', 'data_saida', 'destino'],
    required: ['id_produto', 'id_funcionario', 'quantidade', 'valor_unitario'],
    integerFields: ['id_produto', 'id_funcionario', 'quantidade'],
    decimalFields: ['valor_unitario'],
    dateFields: ['data_saida']
});