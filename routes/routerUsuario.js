const createCrudRouter = require('./createCrudRouter');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const prisma = require('../prismaClient');

const router = createCrudRouter({
    model: 'usuario',
    idColumn: 'id_usu',
    responseKey: 'usuario',
    columns: ['nome', 'email', 'senha', 'contato', 'genero', 'ativo'],
    required: ['nome', 'email', 'senha'],
    booleanFields: ['ativo'],
    select: {
        id_usu: true,
        nome: true,
        email: true,
        contato: true,
        genero: true,
        ativo: true,
        criado_em: true,
        atualizado_em: true
    }
});

router.post('/login', async (req, res, next) => {
    const { email, senha } = req.body || {};
    if (typeof email !== 'string' || typeof senha !== 'string' || !email.trim() || !senha) {
        return res.status(400).json({
            erro: { mensagem: 'Informe e-mail e senha.' }
        });
    }

    try {
        const usuario = await prisma.usuario.findUnique({
            where: { email: email.trim() }
        });

        if (!usuario || usuario.ativo === false) {
            return res.status(401).json({ erro: { mensagem: 'E-mail ou senha inválidos.' } });
        }

        let senhaValida = false;
        if (/^\$2[aby]\$/.test(usuario.senha)) {
            senhaValida = await bcrypt.compare(senha, usuario.senha);
        } else if (/^[a-f\d]{64}$/i.test(usuario.senha)) {
            const senhaHash = crypto.createHash('sha256').update(senha).digest();
            const hashArmazenado = Buffer.from(usuario.senha, 'hex');
            senhaValida = crypto.timingSafeEqual(senhaHash, hashArmazenado);

            if (senhaValida) {
                const novoHash = await bcrypt.hash(senha, 12);
                await prisma.usuario.update({
                    where: { id_usu: usuario.id_usu },
                    data: { senha: novoHash }
                });
            }
        } else {
            senhaValida = await bcrypt.compare(senha, usuario.senha);
        }

        if (!senhaValida) {
            return res.status(401).json({ erro: { mensagem: 'E-mail ou senha inválidos.' } });
        }

        await prisma.log.create({
            data: {
                usuarios: usuario.email,
                tabela_afetada: 'usuarios',
                acao: 'LOGIN',
                registro: usuario.id_usu,
                data_hora: new Date()
            }
        });

        const { senha: senhaArmazenada, ...usuarioAutenticado } = usuario;
        res.status(200).json({
            mensagem: 'Login realizado com sucesso.',
            usuario: usuarioAutenticado
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;