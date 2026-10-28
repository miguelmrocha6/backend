const createCrudRouter = require('./createCrudRouter');

module.exports = createCrudRouter({
    model: 'funcionario',
    idColumn: 'id_funcionario',
    responseKey: 'funcionarios',
    columns: ['nome', 'cargo', 'salario', 'telefone', 'email', 'data_admissao', 'ativo'],
    required: ['nome', 'cargo', 'salario'],
    dateFields: ['data_admissao'],
    decimalFields: ['salario'],
    booleanFields: ['ativo']
});