const express = require('express');
const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');

function createCrudRouter({ model, idColumn, responseKey, columns, required = [], dateFields = [], integerFields = [], decimalFields = [], booleanFields = [], select }) {
    const router = express.Router();
    const allowedColumns = new Set(columns);
    const modelClient = prisma[model];

    if (!modelClient) {
        throw new Error(`Modelo Prisma "${model}" não encontrado.`);
    }

    function validateId(req, res, next) {
        if (!/^\d+$/.test(req.params.id) || !Number.isSafeInteger(Number(req.params.id)) || Number(req.params.id) < 1) {
            return res.status(400).json({ erro: { mensagem: 'ID inválido.' } });
        }
        next();
    }

    function readBody(req, res) {
        if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
            res.status(400).json({ erro: { mensagem: 'O corpo da requisição deve ser um objeto JSON.' } });
            return null;
        }

        const entries = Object.entries(req.body);
        const invalidFields = entries.filter(([field]) => !allowedColumns.has(field));
        if (invalidFields.length > 0) {
            res.status(400).json({
                erro: { mensagem: `Campo(s) inválido(s): ${invalidFields.map(([field]) => field).join(', ')}.` }
            });
            return null;
        }

        for (const entry of entries) {
            const [field, value] = entry;
            if (value === undefined || value === null || value === '') continue;

            if (dateFields.includes(field)) {
                const date = new Date(value);
                if (Number.isNaN(date.getTime())) {
                    res.status(400).json({ erro: { mensagem: `Data inválida no campo ${field}.` } });
                    return null;
                }
                entry[1] = date;
            } else if (integerFields.includes(field)) {
                const integer = Number(value);
                if (!Number.isSafeInteger(integer)) {
                    res.status(400).json({ erro: { mensagem: `O campo ${field} deve ser um número inteiro.` } });
                    return null;
                }
                entry[1] = integer;
            } else if (decimalFields.includes(field)) {
                const decimal = Number(value);
                if (!Number.isFinite(decimal)) {
                    res.status(400).json({ erro: { mensagem: `O campo ${field} deve ser numérico.` } });
                    return null;
                }
                entry[1] = decimal;
            } else if (booleanFields.includes(field)) {
                if ([true, 1, '1', 'true'].includes(value)) {
                    entry[1] = true;
                } else if ([false, 0, '0', 'false'].includes(value)) {
                    entry[1] = false;
                } else {
                    res.status(400).json({ erro: { mensagem: `O campo ${field} deve ser booleano.` } });
                    return null;
                }
            }
        }
        return entries;
    }

    function sendPrismaError(error, next) {
        if (error.code === 'P2025') {
            return { status: 404, message: 'Registro não encontrado.' };
        }
        if (error.code === 'P2002') {
            return { status: 409, message: 'Já existe um registro com esse valor único.' };
        }
        if (error.code === 'P2003') {
            return { status: 409, message: 'A operação viola um relacionamento do banco de dados.' };
        }
        next(error);
        return null;
    }

    async function prepareData(entries) {
        const data = Object.fromEntries(entries);
        if (model === 'usuario' && typeof data.senha === 'string') {
            data.senha = await bcrypt.hash(data.senha, 12);
        }
        return data;
    }

    router.get('/', async (req, res, next) => {
        try {
            const rows = await modelClient.findMany(select ? { select } : undefined);
            res.status(200).json({ [responseKey]: rows });
        } catch (error) {
            next(error);
        }
    });

    router.get('/:id', validateId, async (req, res, next) => {
        try {
            const record = await modelClient.findUnique({
                where: { [idColumn]: Number(req.params.id) },
                ...(select ? { select } : {})
            });
            if (!record) {
                return res.status(404).json({ erro: { mensagem: 'Registro não encontrado.' } });
            }
            res.status(200).json({ [responseKey]: [record] });
        } catch (error) {
            next(error);
        }
    });

    router.post('/', async (req, res, next) => {
        const entries = readBody(req, res);
        if (!entries) return;

        const body = Object.fromEntries(entries);
        const missingFields = required.filter((field) => body[field] === undefined || body[field] === null || body[field] === '');
        if (missingFields.length > 0) {
            return res.status(400).json({
                erro: { mensagem: `Campo(s) obrigatório(s): ${missingFields.join(', ')}.` }
            });
        }

        if (entries.length === 0) {
            return res.status(400).json({ erro: { mensagem: 'Informe os campos do registro.' } });
        }

        try {
            const record = await modelClient.create({ data: await prepareData(entries) });
            res.status(201).json({
                mensagem: 'Registro criado com sucesso.',
                [idColumn]: record[idColumn]
            });
        } catch (error) {
            const handled = sendPrismaError(error, next);
            if (handled) res.status(handled.status).json({ erro: { mensagem: handled.message } });
        }
    });

    router.patch('/:id', validateId, async (req, res, next) => {
        const entries = readBody(req, res);
        if (!entries) return;
        if (entries.length === 0) {
            return res.status(400).json({ erro: { mensagem: 'Informe ao menos um campo para atualizar.' } });
        }

        try {
            await modelClient.update({
                where: { [idColumn]: Number(req.params.id) },
                data: await prepareData(entries)
            });
            res.status(200).json({ mensagem: 'Registro atualizado com sucesso.' });
        } catch (error) {
            const handled = sendPrismaError(error, next);
            if (handled) res.status(handled.status).json({ erro: { mensagem: handled.message } });
        }
    });

    router.delete('/:id', validateId, async (req, res, next) => {
        try {
            await modelClient.delete({ where: { [idColumn]: Number(req.params.id) } });
            res.status(200).json({ mensagem: 'Registro removido com sucesso.' });
        } catch (error) {
            const handled = sendPrismaError(error, next);
            if (handled) res.status(handled.status).json({ erro: { mensagem: handled.message } });
        }
    });

    return router;
}

module.exports = createCrudRouter;