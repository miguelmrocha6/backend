const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
    model: 'produto',
    idColumn: 'id_produto',
    responseKey: 'produtos',
    columns: ['nome', 'descricao', 'preco', 'imagem_produto'],
    required: ['descricao', 'preco', 'imagem_produto'],
    decimalFields: ['preco']
});