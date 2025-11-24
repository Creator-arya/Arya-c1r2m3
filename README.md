# Sistema de Gerenciamento de Propostas

Um sistema web completo para gerenciamento de propostas com autenticação, separação de papéis (Admin e Master), cadastro de propostas, histórico e cálculo automático de comissões individualizadas por usuário, banco e tipo de proposta.

## Características

- **Autenticação OAuth** integrada com Manus
- **Separação de Papéis**: Admin vê todas as propostas, usuários Master veem apenas suas próprias propostas
- **Cadastro de Propostas** com campos:
  - Número da proposta
  - Número de parcelas
  - Banco
  - Valor
  - Tipo (Novo, Refinanciamento, Portabilidade, Refin da Portabilidade, Refin de Carteira, FGTS, CLT, Outros)
- **Cálculo Automático de Comissão** baseado em percentuais configuráveis por usuário, banco e tipo
- **Histórico Completo** de propostas com data de criação
- **Gerenciamento de Comissões** (apenas Admin) para configurar percentuais por usuário/banco/tipo
- **Interface Responsiva** com Tailwind CSS e componentes shadcn/ui

## Stack Tecnológico

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4 + shadcn/ui
- **Backend**: Express 4 + tRPC 11 + Drizzle ORM
- **Database**: MySQL/TiDB
- **Autenticação**: Manus OAuth
- **Build Tool**: Vite

## Instalação Local

### Pré-requisitos

- Node.js 18+
- pnpm (ou npm/yarn)
- Conta no Manus com credenciais OAuth configuradas

### Passos

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd sistema-propostas
```

2. Instale as dependências:
```bash
pnpm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env.local
```

4. Preencha as variáveis de ambiente necessárias:
```env
DATABASE_URL=mysql://user:password@localhost:3306/propostas
JWT_SECRET=sua-chave-secreta
VITE_APP_ID=seu-app-id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im
```

5. Execute as migrações do banco de dados:
```bash
pnpm db:push
```

6. Inicie o servidor de desenvolvimento:
```bash
pnpm dev
```

O aplicativo estará disponível em `http://localhost:5173`

## Uso

### Para Usuários Master

1. Faça login com suas credenciais
2. Vá para "Nova Proposta" para cadastrar uma proposta
3. Preencha os dados:
   - Número da proposta
   - Número de parcelas
   - Banco
   - Valor
   - Tipo de proposta
4. A comissão será calculada automaticamente baseada nas configurações do Admin
5. Visualize o histórico de suas propostas em "Histórico de Propostas"

### Para Admin

1. Faça login com credenciais de administrador
2. Vá para "Gerenciar Comissões"
3. Configure os percentuais de comissão para cada combinação de:
   - Usuário
   - Banco
   - Tipo de proposta
4. Visualize todas as propostas de todos os usuários em "Histórico de Propostas"

## Estrutura do Projeto

```
sistema-propostas/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── pages/            # Páginas da aplicação
│   │   ├── components/       # Componentes reutilizáveis
│   │   ├── lib/              # Bibliotecas e utilitários
│   │   ├── App.tsx           # Roteamento principal
│   │   └── main.tsx          # Entry point
│   └── public/               # Arquivos estáticos
├── server/                    # Backend Express + tRPC
│   ├── routers.ts            # Procedimentos tRPC
│   ├── db.ts                 # Funções de banco de dados
│   └── _core/                # Infraestrutura interna
├── drizzle/                   # Schema e migrações
│   └── schema.ts             # Definição das tabelas
├── shared/                    # Código compartilhado
└── package.json
```

## Banco de Dados

### Tabelas

#### users
- `id`: Chave primária
- `openId`: ID do OAuth (único)
- `name`: Nome do usuário
- `email`: Email
- `role`: Papel (user, admin, master)
- `createdAt`, `updatedAt`: Timestamps

#### propostas
- `id`: Chave primária
- `userId`: ID do usuário que criou
- `numeroProposta`: Número único da proposta
- `numeroParcelas`: Quantidade de parcelas
- `banco`: Nome do banco
- `valor`: Valor da proposta (decimal)
- `tipo`: Tipo de proposta (enum)
- `comissao`: Valor da comissão calculada
- `createdAt`, `updatedAt`: Timestamps

#### comissoes
- `id`: Chave primária
- `userId`: ID do usuário
- `banco`: Nome do banco
- `tipo`: Tipo de proposta
- `percentual`: Percentual de comissão
- `ativo`: Se está ativa ou não
- `createdAt`, `updatedAt`: Timestamps

## Deploy

### Northflank

1. Conecte seu repositório GitHub ao Northflank
2. Configure as variáveis de ambiente no painel do Northflank:
   - DATABASE_URL
   - JWT_SECRET
   - VITE_APP_ID
   - OAUTH_SERVER_URL
   - VITE_OAUTH_PORTAL_URL
   - Outras variáveis necessárias

3. Configure o build command:
```bash
pnpm install && pnpm db:push && pnpm build
```

4. Configure o start command:
```bash
pnpm start
```

5. Defina a porta como 3000

## Procedimentos tRPC Disponíveis

### Propostas
- `propostas.create`: Criar nova proposta
- `propostas.list`: Listar propostas (Admin vê todas, usuários veem suas próprias)
- `propostas.update`: Atualizar proposta
- `propostas.delete`: Deletar proposta

### Comissões
- `comissoes.create`: Criar comissão (Admin only)
- `comissoes.listByUser`: Listar comissões de um usuário
- `comissoes.listAll`: Listar todas as comissões (Admin only)
- `comissoes.update`: Atualizar comissão (Admin only)
- `comissoes.delete`: Deletar comissão (Admin only)

### Usuários
- `users.listAll`: Listar todos os usuários (Admin only)

## Segurança

- Todas as rotas protegidas requerem autenticação OAuth
- Admin pode acessar dados de todos os usuários
- Usuários Master só podem acessar suas próprias propostas
- As comissões são calculadas automaticamente no servidor
- Validação de entrada em todos os procedimentos tRPC

## Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build

# Executar migrações
pnpm db:push

# Gerar tipos TypeScript
pnpm db:generate
```

## Troubleshooting

### Erro de conexão com banco de dados
- Verifique se a variável `DATABASE_URL` está correta
- Certifique-se de que o banco de dados está acessível

### Comissão não está sendo calculada
- Verifique se a comissão foi configurada para o usuário, banco e tipo específicos
- Certifique-se de que a comissão está marcada como "ativa"

### Usuário não consegue fazer login
- Verifique as variáveis de ambiente OAuth
- Certifique-se de que o usuário está registrado no Manus

## Contribuindo

Para contribuir com melhorias:

1. Crie uma branch para sua feature
2. Faça suas alterações
3. Envie um pull request

## Licença

Este projeto é propriedade privada.

## Suporte

Para suporte, entre em contato com o administrador do sistema.
