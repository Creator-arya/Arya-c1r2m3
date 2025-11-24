# Guia de Deployment - Sistema de Gerenciamento de Propostas

Este documento fornece instruções detalhadas para fazer deploy do Sistema de Gerenciamento de Propostas no Northflank e GitHub.

## Preparação para GitHub

### 1. Inicializar Repositório Git

```bash
cd sistema-propostas
git init
git add .
git commit -m "Initial commit: Sistema de Gerenciamento de Propostas"
```

### 2. Criar Repositório no GitHub

1. Acesse https://github.com/new
2. Preencha os dados:
   - **Repository name**: sistema-propostas
   - **Description**: Sistema web para gerenciamento de propostas com autenticação e comissões
   - **Visibility**: Private (recomendado)
3. Clique em "Create repository"

### 3. Fazer Push para GitHub

```bash
git remote add origin https://github.com/seu-usuario/sistema-propostas.git
git branch -M main
git push -u origin main
```

## Deploy no Northflank

### 1. Conectar GitHub ao Northflank

1. Acesse https://northflank.com e faça login
2. Vá para "Projects" e crie um novo projeto
3. Selecione "Connect a Git repository"
4. Autorize o acesso ao GitHub
5. Selecione o repositório `sistema-propostas`

### 2. Configurar Build

Na seção de Build Configuration:

**Build Command:**
```bash
pnpm install && pnpm db:push && pnpm build
```

**Dockerfile** (opcional, se usar):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

RUN pnpm db:push
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

### 3. Configurar Runtime

**Start Command:**
```bash
pnpm start
```

**Port:** 3000

### 4. Configurar Variáveis de Ambiente

No painel do Northflank, adicione as seguintes variáveis de ambiente:

| Variável | Valor | Notas |
|----------|-------|-------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/db` | Obtenha do seu provedor de banco de dados |
| `JWT_SECRET` | Gere uma chave aleatória forte | Use `openssl rand -base64 32` |
| `VITE_APP_ID` | ID da aplicação Manus | Obtido no console Manus |
| `OAUTH_SERVER_URL` | `https://api.manus.im` | Padrão |
| `VITE_OAUTH_PORTAL_URL` | `https://portal.manus.im` | Padrão |
| `OWNER_NAME` | Seu nome | Nome do administrador |
| `OWNER_OPEN_ID` | ID do OAuth do admin | Obtido após primeiro login |
| `VITE_APP_TITLE` | `Sistema de Gerenciamento de Propostas` | Título da aplicação |
| `VITE_APP_LOGO` | `/logo.svg` | Caminho do logo |
| `BUILT_IN_FORGE_API_URL` | `https://api.manus.im` | Padrão |
| `BUILT_IN_FORGE_API_KEY` | Chave da API Manus | Obtida no console Manus |
| `VITE_FRONTEND_FORGE_API_URL` | `https://api.manus.im` | Padrão |
| `VITE_FRONTEND_FORGE_API_KEY` | Chave frontend Manus | Obtida no console Manus |

### 5. Configurar Banco de Dados

#### Opção A: Usando MySQL Gerenciado

1. No Northflank, crie um novo serviço MySQL
2. Configure o usuário e senha
3. Crie um banco de dados chamado `sistema_propostas`
4. Use a string de conexão fornecida como `DATABASE_URL`

#### Opção B: Usando Banco Externo

Se usar um banco de dados externo (AWS RDS, DigitalOcean, etc.):

1. Crie um banco de dados MySQL 8.0+
2. Configure as credenciais
3. Adicione a `DATABASE_URL` nas variáveis de ambiente

**Formato da DATABASE_URL:**
```
mysql://usuario:senha@host:3306/nome_do_banco
```

### 6. Configurar Domínio

1. No painel do Northflank, vá para "Domains"
2. Adicione seu domínio personalizado ou use o domínio padrão fornecido
3. Configure o SSL (automático)

### 7. Deploy

1. Clique em "Deploy" no painel
2. Acompanhe o progresso no log de build
3. Após sucesso, a aplicação estará disponível no domínio configurado

## Verificação Pós-Deploy

Após o deploy, verifique:

1. **Acesso à Aplicação**
   - Visite a URL da aplicação
   - Verifique se a página inicial carrega corretamente

2. **Autenticação OAuth**
   - Clique em "Fazer Login"
   - Verifique se o fluxo de login funciona
   - Confirme se o usuário é criado no banco de dados

3. **Funcionalidades Básicas**
   - Crie uma nova proposta
   - Verifique se a comissão é calculada
   - Visualize o histórico de propostas

4. **Logs**
   - Verifique os logs no Northflank para erros
   - Monitore o uso de recursos

## Troubleshooting

### Erro: "Database connection failed"
- Verifique se `DATABASE_URL` está correto
- Certifique-se de que o banco de dados está acessível
- Verifique firewall e regras de segurança

### Erro: "OAuth configuration invalid"
- Verifique as credenciais do Manus
- Certifique-se de que `VITE_APP_ID` está correto
- Confirme que a URL de callback está registrada no Manus

### Erro: "Build failed"
- Verifique os logs de build
- Certifique-se de que todas as dependências estão instaladas
- Confirme que o comando `pnpm db:push` funciona localmente

### Aplicação lenta
- Verifique o uso de CPU e memória
- Otimize as queries do banco de dados
- Considere aumentar os recursos alocados

## Atualizações

Para atualizar a aplicação após mudanças:

1. Faça commit e push para o GitHub:
```bash
git add .
git commit -m "Descrição das mudanças"
git push origin main
```

2. O Northflank detectará automaticamente as mudanças e iniciará um novo build
3. Acompanhe o progresso no painel

## Backup e Recuperação

### Backup do Banco de Dados

```bash
# Fazer backup local
mysqldump -u usuario -p nome_do_banco > backup.sql

# Restaurar de um backup
mysql -u usuario -p nome_do_banco < backup.sql
```

### Rollback de Deploy

Se um deploy causar problemas:

1. No Northflank, vá para "Deployments"
2. Selecione a versão anterior
3. Clique em "Rollback"

## Monitoramento

Configure alertas no Northflank para:

- Falhas de build
- Uso de CPU > 80%
- Uso de memória > 80%
- Taxa de erro > 5%
- Tempo de resposta > 2s

## Segurança

1. **Senhas Fortes**
   - Use senhas complexas para banco de dados
   - Mude `JWT_SECRET` regularmente

2. **HTTPS**
   - Sempre use HTTPS em produção
   - Configure HSTS

3. **Atualizações**
   - Mantenha as dependências atualizadas
   - Revise regularmente os logs de segurança

4. **Acesso**
   - Restrinja acesso ao painel Northflank
   - Use autenticação de dois fatores

## Suporte

Para problemas com:
- **Northflank**: https://docs.northflank.com
- **Manus**: https://help.manus.im
- **MySQL**: https://dev.mysql.com/doc

## Próximos Passos

Após o deploy bem-sucedido:

1. Teste todas as funcionalidades em produção
2. Configure backups automáticos
3. Configure monitoramento
4. Documente procedimentos operacionais
5. Treine usuários no sistema
