const http = require('http');
const app = require('./app');



const server = http.createServer(app);

const PORT = Number(process.env.PORT) || 8100;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});