# PRD — Intranet de Treinamentos
> Cole este prompt diretamente no Cline para iniciar o projeto

---

## PROMPT INICIAL

Quero construir uma intranet corporativa de treinamentos. Antes de escrever qualquer código, leia este PRD completo, apresente um plano de execução com as etapas e aguarde minha aprovação.

---

### Visão Geral

Sistema web interno para consumo de treinamentos em vídeo e PDF. Dois perfis de acesso: usuário comum e administrador. O sistema deve registrar exatamente onde cada usuário parou em cada conteúdo e permitir retomada.

---

### Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend/Auth/Storage:** Supabase
- **Deploy:** Vercel

---

### Perfis de Usuário

**Usuário comum**
- Faz login com e-mail e senha (via Supabase Auth)
- Visualiza todos os conteúdos disponíveis (globais + do seu setor)
- Assiste vídeos e lê PDFs dentro da plataforma
- Progresso salvo automaticamente (retoma de onde parou)
- Visualiza quais conteúdos já concluiu

**Administrador**
- Tudo que o usuário comum pode fazer
- Cadastra novos conteúdos (título, tipo, URL/upload, setor ou global)
- Remove conteúdos existentes
- Visualiza dashboard com progresso de todos os usuários
- Filtra progresso por usuário, setor ou conteúdo

---

### Funcionalidades por Tela

**1. Login**
- Tela simples com e-mail e senha
- Redirecionamento automático conforme role (user → /dashboard, admin → /admin)

**2. Dashboard do Usuário (/dashboard)**
- Listagem de conteúdos: aba "Todos" e abas por setor
- Card de cada conteúdo: título, tipo (vídeo/PDF), progresso (barra), badge "Concluído"
- Ao clicar, abre o player/viewer

**3. Player de Vídeo (/treinamento/[id])**
- Player nativo HTML5 ou react-player
- Salva posição atual a cada 10 segundos via Supabase
- Retoma automaticamente do ponto salvo
- Marca como concluído ao atingir 90% assistido

**4. Viewer de PDF (/treinamento/[id])**
- Renderiza PDF com react-pdf
- Salva número da página atual a cada virada
- Marca como concluído ao chegar na última página

**5. Painel Admin (/admin)**
- Tabela de usuários com progresso geral (% de conteúdos concluídos)
- Ao clicar no usuário: detalhe do progresso por conteúdo (onde parou em cada um)
- Botão para adicionar novo conteúdo (modal com formulário)
- Botão para remover conteúdo (com confirmação)

---

### Schema do Banco de Dados (Supabase)

Crie as seguintes tabelas usando o MCP do Supabase. Mostre o SQL antes de executar:

```sql
-- Setores da empresa
create table sectors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz default now()
);

-- Perfil dos usuários (complementa auth.users)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role text not null default 'user' check (role in ('user', 'admin')),
  sector_id uuid references sectors(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Conteúdos de treinamento
create table contents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('video', 'pdf')),
  url text not null,
  sector_id uuid references sectors(id), -- null = global (todos os setores)
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Progresso do usuário em cada conteúdo
create table progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  content_id uuid not null references contents(id) on delete cascade,
  position numeric default 0, -- segundos (vídeo) ou número da página (PDF)
  completed boolean default false,
  updated_at timestamptz default now(),
  unique(user_id, content_id)
);
```

**RLS obrigatório em todas as tabelas:**
- `profiles`: usuário lê/edita apenas o próprio perfil; admin lê todos
- `contents`: todos os usuários autenticados leem; apenas admin insere/atualiza/remove
- `progress`: usuário lê/escreve apenas o próprio progresso; admin lê todos
- `sectors`: todos os usuários autenticados leem; apenas admin escreve

---

### Estrutura de Pastas Esperada

```
/app
  /login
  /dashboard
  /treinamento/[id]
  /admin
/components
  /ui          ← componentes genéricos (Button, Card, Badge, Modal)
  /player      ← VideoPlayer, PdfViewer
  /admin       ← componentes exclusivos do painel admin
/lib
  supabase.ts  ← cliente Supabase (server + client)
  types.ts     ← tipos gerados do Supabase
/hooks
  useProgress.ts   ← hook para salvar/carregar progresso
  useContents.ts   ← hook para listar conteúdos com filtro de setor
```

---

### Ordem de Execução Sugerida

1. Criar schema no Supabase (via MCP) + configurar RLS
2. Configurar projeto Next.js com Supabase + gerar tipos TypeScript
3. Tela de login com Supabase Auth
4. Dashboard do usuário com listagem de conteúdos por setor
5. Player de vídeo com salvamento de progresso
6. Viewer de PDF com salvamento de progresso
7. Painel do admin (dashboard de progresso + gestão de conteúdos)

---

### Restrições Importantes

- Não hardcodar nenhuma URL, chave ou credencial — usar sempre variáveis de ambiente
- Nunca executar DELETE ou DROP no banco sem mostrar o comando e aguardar confirmação
- Ao alterar o schema, sempre regenerar os tipos TypeScript do Supabase
- Toda operação de banco deve usar o MCP do Supabase
- Criar tratamento de erro visível para o usuário em todas as operações assíncronas

---

**Pode apresentar o plano de execução agora.**
