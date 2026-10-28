const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
    model: 'historicoDePrecos',
    idColumn: 'id_historico_de_precos',
    responseKey: 'historico_de_precos',
    columns: ['id_produto', 'preco', 'vigencia'],
    integerFields: ['id_produto'],
    decimalFields: ['preco'],
    dateFields: ['vigencia']
});