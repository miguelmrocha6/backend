const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
    model: 'pedido',
    idColumn: 'id_pedido',
    responseKey: 'pedidos',
    columns: ['status', 'data_pedido', 'id_cliente'],
    dateFields: ['data_pedido'],
    integerFields: ['id_cliente'],
    booleanFields: ['status']
});