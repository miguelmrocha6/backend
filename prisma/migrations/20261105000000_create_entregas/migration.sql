CREATE TABLE `entregas` (
  `id_entrega` int NOT NULL AUTO_INCREMENT,
  `id_pedido` int NOT NULL,
  `endereco` varchar(200) NOT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` char(2) DEFAULT NULL,
  `cep` varchar(10) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'Pendente',
  `data_entrega` date DEFAULT NULL,
  `criado_em` timestamp NULL DEFAULT current_timestamp(),
  `atualizado_em` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_entrega`),
  UNIQUE KEY `entregas_id_pedido_key` (`id_pedido`),
  CONSTRAINT `fk_entregas_pedidos` FOREIGN KEY (`id_pedido`) REFERENCES `pedidos` (`id_pedido`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
