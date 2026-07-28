# InstaPasso — Documentação do Sistema

**InstaPasso** é o provedor de identidade (IdP) central da plataforma Portal ITSM. Ele gerencia a autenticação de operadores e clientes via Google SSO, controla quais domínios e e-mails têm acesso ao sistema, e serve como ponto de entrada seguro para a emissão de tokens de acesso ao Portal IA.

---

## 🏗️ Visão Geral

```text
InstaPasso/
├── hosting/           # Frontend: Vite + React + TypeScript
│   ├── src/
│   │   ├── firebase.ts     # Configuração Firebase (lê variáveis do .env)
│   │   └── ...
│   ├── .env           # ⚠️ NÃO commitar — variáveis de ambiente locais
│   ├── .env.example   # Modelo de variáveis
│   └── index.html     # Proteção anti-inspeção (DevTools block, context menu)
├── functions/         # Cloud Functions (futuras implementações)
└── firestore.rules    # Regras de segurança do banco InstaPasso
```

### Stack Tecnológico
- **Frontend:** React, Vite, TypeScript, Tailwind CSS.
- **Backend:** Firebase Auth (Google SSO), Firestore.
- **Hospedagem:** Vercel (`insta-passo.vercel.app`).

---

## 🛡️ Papel na Arquitetura de Segurança

O InstaPasso atua como **Provedor de Identidade (IdP)** no fluxo Zero Trust do Portal ITSM:

```
  [Usuário]
      │
      │ 1. Clica em "Entrar com Google"
      ▼
  [InstaPasso (este sistema)]
      │
      │ 2. Valida o domínio/e-mail nas coleções `domains` e `operators`
      │ 3. Emite um ID Token criptografado assinado pelo Firebase
      ▼
  [Portal ITSM Frontend]
      │
      │ 4. Envia o ID Token para a API NestJS do Portal
      ▼
  [API NestJS — /api/auth/portal-token]
      │
      │ 5. Verifica a assinatura do ID Token
      │ 6. Emite um Custom Token com o cargo (role) do usuário
      ▼
  [Portal IA — Firestore]
      └─ Só libera os dados se o Custom Token tiver a role correta.
```

> O InstaPasso **não tem acesso** ao banco de dados do Portal IA. Ele apenas autentica quem é o usuário. A autorização (o que ele pode fazer) é responsabilidade da API NestJS.

---

## ⚙️ Como Executar (Ambiente de Desenvolvimento)

### 1. Pré-requisitos
- Node.js (versão 20+)
- Arquivo `.env` preenchido (copiar de `.env.example`)

### 2. Configurar Variáveis de Ambiente
```bash
cd hosting
cp .env.example .env
# Preencher o .env com as chaves reais do Firebase do InstaPasso
```

### 3. Rodando Localmente
```bash
cd hosting
npm install
npm run dev
```
Acesse: **http://localhost:5173**

---

## 🔑 Variáveis de Ambiente Necessárias

Todas as variáveis ficam no arquivo `hosting/.env` (nunca no código-fonte):

| Variável | Descrição |
|---|---|
| `VITE_FIREBASE_API_KEY` | Chave de API do projeto Firebase InstaPasso |
| `VITE_FIREBASE_AUTH_DOMAIN` | Domínio de autenticação (`instapasso.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | ID do projeto (`instapasso`) |
| `VITE_FIREBASE_STORAGE_BUCKET` | Bucket de storage |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ID do remetente de mensagens |
| `VITE_FIREBASE_APP_ID` | ID do app Firebase |

---

## 🗄️ Estrutura do Banco de Dados (Firestore — InstaPasso)

### Coleção `domains`
Controla quais domínios de e-mail têm acesso ao portal operacional.
```json
{
  "domain": "tiecia.com.br",
  "active": true,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Coleção `operators`
Cadastro dos operadores autorizados com seus cargos.
```json
{
  "email": "operador@tiecia.com.br",
  "name": "Nome do Operador",
  "type": "Administrator",
  "active": true
}
```

> Os valores do campo `type` disponíveis são: `Administrator`, `Technician`, `Agent`.

---

## 🔒 Segurança

- **Proteção do Código Fonte no Browser:** O `index.html` inclui proteção contra DevTools (F12 bloqueado), menu de contexto desabilitado e prevenção de seleção de texto.
- **Chaves de API:** Todas as chaves Firebase ficam em `.env` (ignorado pelo Git via `.gitignore`) e são injetadas como variáveis de ambiente na Vercel.
- **Firestore Rules:** O banco do InstaPasso possui regras de segurança que impedem leitura e escrita não autorizadas diretamente pelo navegador.

---

## 🚀 Deploy (Vercel)

O site é hospedado na Vercel em `insta-passo.vercel.app`.

Para fazer o deploy, as variáveis do `.env` devem ser configuradas no painel da Vercel em:
**Settings → Environment Variables**

Após configurar, clique em **Deployments → Redeploy** para o site ser reconstruído com as novas chaves.

---

## 🚀 Status do Projeto

- [x] Autenticação Google SSO via Firebase.
- [x] Validação de domínios e operadores autorizados.
- [x] Proteção anti-inspeção no Frontend.
- [x] Variáveis de ambiente protegidas (sem chaves no código-fonte).
- [x] Integração com Portal ITSM via ID Token.
- [ ] Painel de gerenciamento de operadores (CRUD visual).
- [ ] Logs de acesso e auditoria.
