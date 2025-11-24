# Sistema de Gerenciamento de Propostas - TODO

## Autenticação e Controle de Acesso
- [x] Projeto inicializado com autenticação OAuth
- [x] Implementar papéis de usuário (Admin, Master)
- [x] Implementar procedimentos tRPC protegidos com controle de acesso por papel
- [ ] Criar página de login com seleção de papel
- [ ] Implementar proteção de rotas baseada em papel

## Banco de Dados
- [x] Criar tabela de usuários com papel (Admin/Master)
- [x] Criar tabela de propostas
- [x] Criar tabela de comissões por usuário e tipo/banco
- [x] Criar funções de banco de dados para CRUD de propostas e comissões

## Funcionalidades do Admin
- [x] Dashboard do Admin com visão geral de todos os dados
- [x] Página de gerenciamento de comissões por usuário
- [x] Página de gerenciamento de comissões por tipo de proposta/banco
- [x] Visualizar todas as propostas de todos os usuários
- [x] Visualizar histórico completo

## Funcionalidades do Master/Usuário Normal
- [x] Dashboard do Master com suas propostas
- [x] Formulário de cadastro de propostas com campos:
  - [x] Número da proposta
  - [x] Número de parcelas
  - [x] Banco
  - [x] Valor
  - [x] Tipo (Novo, Refinanciamento, Portabilidade, Refin da Portabilidade, Refin de Carteira, FGTS, CLT, Outros)
  - [x] Cálculo automático de comissão
- [x] Visualizar apenas suas próprias propostas
- [x] Histórico de propostas cadastradas
- [x] Deletar propostas

## Interface de Usuário
- [x] Layout com sidebar para navegação (DashboardLayout)
- [x] Página inicial/dashboard
- [x] Componentes de formulário para propostas
- [x] Tabelas com dados de propostas
- [x] Notificações de sucesso/erro

## Testes e Validação
- [x] Implementar separação de dados (Admin vê tudo, Master vê apenas suas propostas)
- [x] Implementar cálculo de comissão automático
- [x] Implementar validação de formulários
- [x] Implementar controle de acesso por papel

## Documentação e Deploy
- [x] Criar README.md com instruções de instalação
- [x] Preparar para GitHub
- [x] Documentar instruções para Northflank (DEPLOYMENT.md)
- [x] Criar arquivo de configuração para deploy

## Entrega
- [ ] Salvar checkpoint do projeto
- [ ] Fornecer arquivo do projeto ao usuário


## Alteracoes Solicitadas - Autenticacao Local
- [x] Remover autenticacao OAuth e implementar login local
- [x] Adicionar campo de senha com hash no banco de dados
- [x] Criar pagina de login com usuario/senha
- [x] Criar painel de admin para cadastrar novos usuarios
- [x] Remover opcao de login Google
- [x] Testar login com admin/admin123@@@
