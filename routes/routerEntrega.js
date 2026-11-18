const express = require('express');
const PDFDocument = require('pdfkit');
const prisma = require('../prismaClient');

const router = express.Router();
const statuses = new Set(['Pendente', 'Em rota', 'Entregue', 'Cancelada']);
const allowedFields = new Set(['id_pedido', 'endereco', 'cidade', 'estado', 'cep', 'latitude', 'longitude', 'status', 'data_entrega']);
const deliveryInclude = { pedido: { include: { cliente: true } } };

function parseBody(body, partial = false) {
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
        return { error: 'O corpo da requisição deve ser um objeto JSON.' };
    }

    const invalidFields = Object.keys(body).filter((field) => !allowedFields.has(field));
    if (invalidFields.length) return { error: `Campo(s) inválido(s): ${invalidFields.join(', ')}.` };

    const data = {};
    for (const [field, value] of Object.entries(body)) {
        if (value === undefined) continue;
        if (value === null || value === '') {
            if (['cidade', 'estado', 'cep', 'latitude', 'longitude', 'data_entrega'].includes(field)) data[field] = null;
            else if (!partial || field === 'endereco' || field === 'id_pedido' || field === 'status') return { error: `O campo ${field} não pode ficar vazio.` };
            continue;
        }

        if (field === 'id_pedido') {
            const orderId = Number(value);
            if (!Number.isSafeInteger(orderId) || orderId < 1) return { error: 'id_pedido deve ser um inteiro positivo.' };
            data[field] = orderId;
        } else if (['latitude', 'longitude'].includes(field)) {
            const coordinate = Number(value);
            const limit = field === 'latitude' ? 90 : 180;
            if (!Number.isFinite(coordinate) || coordinate < -limit || coordinate > limit) return { error: `${field} está fora do intervalo permitido.` };
            data[field] = coordinate;
        } else if (field === 'data_entrega') {
            const date = new Date(value);
            if (Number.isNaN(date.getTime())) return { error: 'data_entrega inválida.' };
            data[field] = date;
        } else if (field === 'status') {
            if (!statuses.has(value)) return { error: 'Status inválido. Use Pendente, Em rota, Entregue ou Cancelada.' };
            data[field] = value;
        } else {
            const text = String(value).trim();
            const maxLengths = { endereco: 200, cidade: 100, estado: 2, cep: 10 };
            if (maxLengths[field] && text.length > maxLengths[field]) return { error: `${field} excede o limite de ${maxLengths[field]} caracteres.` };
            data[field] = field === 'estado' ? text.toUpperCase() : text;
        }
    }

    if (!partial && (!data.id_pedido || !data.endereco)) {
        return { error: 'id_pedido e endereco são obrigatórios.' };
    }
    if (Object.keys(data).length === 0) return { error: 'Informe ao menos um campo para atualizar.' };
    return { data };
}

function handlePrismaError(error, res, next) {
    if (error.code === 'P2002') return res.status(409).json({ erro: { mensagem: 'Este pedido já possui uma entrega.' } });
    if (error.code === 'P2003') return res.status(409).json({ erro: { mensagem: 'O pedido informado não existe ou está associado a uma entrega.' } });
    if (error.code === 'P2025') return res.status(404).json({ erro: { mensagem: 'Entrega não encontrada.' } });
    return next(error);
}

router.get('/relatorio.pdf', async (req, res, next) => {
    try {
        const deliveries = await prisma.entrega.findMany({ include: deliveryInclude, orderBy: { criado_em: 'desc' } });
        const document = new PDFDocument({ size: 'A4', margin: 42, autoFirstPage: true });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="relatorio-entregas.pdf"');
        document.pipe(res);
        document.fontSize(18).text('Relatório de entregas');
        document.moveDown(0.35).fontSize(9).fillColor('#52635a').text(`Gerado em ${new Date().toLocaleString('pt-BR')} · ${deliveries.length} entrega(s)`);
        document.moveDown(1).fillColor('#182b25');

        for (const delivery of deliveries) {
            if (document.y > 690) document.addPage();
            const customer = delivery.pedido?.cliente?.nome || 'Cliente não informado';
            document.fontSize(11).font('Helvetica-Bold').text(`Entrega ${delivery.id_entrega} · Pedido ${delivery.id_pedido} · ${delivery.status}`);
            document.font('Helvetica').fontSize(9)
                .text(`Cliente: ${customer}`)
                .text(`Endereço: ${[delivery.endereco, delivery.cidade, delivery.estado, delivery.cep].filter(Boolean).join(', ')}`)
                .text(`Coordenadas: ${delivery.latitude ?? '—'}, ${delivery.longitude ?? '—'}`)
                .text(`Data: ${delivery.data_entrega ? new Date(delivery.data_entrega).toLocaleDateString('pt-BR') : 'Não informada'}`);
            document.moveDown(0.8);
        }
        document.end();
    } catch (error) {
        next(error);
    }
});

router.get('/', async (req, res, next) => {
    try {
        const entregas = await prisma.entrega.findMany({ include: deliveryInclude, orderBy: { criado_em: 'desc' } });
        res.status(200).json({ entregas });
    } catch (error) {
        next(error);
    }
});

router.get('/:id', async (req, res, next) => {
    if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) return res.status(400).json({ erro: { mensagem: 'ID inválido.' } });
    try {
        const entrega = await prisma.entrega.findUnique({ where: { id_entrega: Number(req.params.id) }, include: deliveryInclude });
        if (!entrega) return res.status(404).json({ erro: { mensagem: 'Entrega não encontrada.' } });
        res.status(200).json({ entregas: [entrega] });
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req, res, next) => {
    const parsed = parseBody(req.body);
    if (parsed.error) return res.status(400).json({ erro: { mensagem: parsed.error } });
    try {
        const order = await prisma.pedido.findUnique({ where: { id_pedido: parsed.data.id_pedido } });
        if (!order) return res.status(404).json({ erro: { mensagem: 'Pedido não encontrado.' } });
        const entrega = await prisma.entrega.create({ data: parsed.data });
        res.status(201).json({ mensagem: 'Entrega solicitada com sucesso.', id_entrega: entrega.id_entrega });
    } catch (error) {
        handlePrismaError(error, res, next);
    }
});

router.patch('/:id', async (req, res, next) => {
    if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) return res.status(400).json({ erro: { mensagem: 'ID inválido.' } });
    const parsed = parseBody(req.body, true);
    if (parsed.error) return res.status(400).json({ erro: { mensagem: parsed.error } });
    try {
        await prisma.entrega.update({ where: { id_entrega: Number(req.params.id) }, data: parsed.data });
        res.status(200).json({ mensagem: 'Entrega atualizada com sucesso.' });
    } catch (error) {
        handlePrismaError(error, res, next);
    }
});

router.delete('/:id', async (req, res, next) => {
    if (!/^\d+$/.test(req.params.id) || Number(req.params.id) < 1) return res.status(400).json({ erro: { mensagem: 'ID inválido.' } });
    try {
        await prisma.entrega.delete({ where: { id_entrega: Number(req.params.id) } });
        res.status(200).json({ mensagem: 'Entrega removida com sucesso.' });
    } catch (error) {
        handlePrismaError(error, res, next);
    }
});

module.exports = router;
