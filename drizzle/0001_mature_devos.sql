CREATE TABLE `comissoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`banco` varchar(100) NOT NULL,
	`tipo` enum('novo','refinanciamento','portabilidade','refin_portabilidade','refin_carteira','fgts','clt','outros') NOT NULL,
	`percentual` decimal(5,2) NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comissoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `propostas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`numeroProposta` varchar(100) NOT NULL,
	`numeroParcelas` int NOT NULL,
	`banco` varchar(100) NOT NULL,
	`valor` decimal(15,2) NOT NULL,
	`tipo` enum('novo','refinanciamento','portabilidade','refin_portabilidade','refin_carteira','fgts','clt','outros') NOT NULL,
	`comissao` decimal(15,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `propostas_id` PRIMARY KEY(`id`)
);
