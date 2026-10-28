
require('dotenv').config();

//1. Dependências e Middlewares
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
const routerUsuario = require('./routes/routerUsuario');
const routerFuncionario = require('./routes/routerFuncionario');
const routerCliente = require('./routes/routerCliente');
const routerEntrada = require('./routes/routerEntrada');
const routerFornecedores = require('./routes/routerFornecedores');
const routerPedido = require('./routes/routerPedido');
const routerProduto = require('./routes/routerProduto');
const routerSaida = require('./routes/routerSaida');
const routerHistoricoDePrecos = require('./routes/routerHistoricoDePrecos');
const routerLog = require('./routes/routerLog');



//2. Controle de CORS (Headers & OPTIONS)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));


//3. Definição de Rotas 
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/documentacao', (req, res) => {
  res.type('text/markdown').sendFile(__dirname + '/API.md');
});

app.use('/usuario', routerUsuario);
app.use('/funcionario', routerFuncionario);
app.use('/cliente', routerCliente);
app.use('/entrada', routerEntrada);
app.use('/fornecedores', routerFornecedores);
app.use('/pedidos', routerPedido);
app.use('/produto', routerProduto);
app.use('/saida', routerSaida);
app.use('/historico-de-precos', routerHistoricoDePrecos);
app.use('/logs', routerLog);


//4. Tratamento de Erros (Fallback & Handler)



app.use((req,res,next)=>{
      const erro = new Error("Não encontrado!");
      erro.status = 404;
      next(erro);
});

app.use((error,req,res,next)=>{
    const status = Number.isInteger(error.status) ? error.status : 500;
  console.error(error);
    res.status(status);
        return res.json({
            erro:{
         mensagem: status === 500 ? 'Erro interno do servidor' : error.message
            }
        })
})

module.exports = app