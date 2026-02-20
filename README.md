# 💪 GainYourMuscle v2.0

🌐 **Site online:** https://gain-your-muscle-v2.vercel.app

Plataforma web completa para motivação fitness, geração de treinos personalizados e acompanhamento de progresso.

## 🎯 Objetivo

Desconstruir a ideia de que:
- Academia é chata
- Resultados só vêm de esteroides ou canetas emagrecedoras
- É preciso dieta extremamente regrada

**Filosofia:** Fitness sustentável, prazeroso e adaptado à SUA vida!

## 🛠️ Stack Tecnológica

### Backend
- **Node.js** + **Express.js** - API REST
- **MongoDB** + **Mongoose** - Banco de dados
- **JWT** - Autenticação
- **bcryptjs** - Criptografia de senhas

### Frontend
- **React** - Interface do usuário
- **React Router** - Navegação
- **Axios** - Requisições HTTP
- **CSS3** - Estilos

## 📁 Estrutura do Projeto

```
GainYourMuscle-v2/
├── backend/
│   ├── config/          # Configurações (DB)
│   ├── controllers/     # Lógica de negócio
│   ├── middleware/      # Autenticação
│   ├── models/          # Schemas MongoDB
│   ├── routes/          # Rotas da API
│   ├── utils/           # Gerador de treinos
│   ├── server.js        # Entrada principal
│   └── .env             # Variáveis de ambiente
│
└── frontend/
    ├── src/
    │   ├── components/  # Componentes React
    │   ├── pages/       # Páginas
    │   ├── services/    # API calls
    │   ├── context/     # Context API (Auth)
    │   └── App.js       # App principal
    └── package.json
```

## 🚀 Como Rodar

### 1. Backend

```bash
cd backend

# Instalar dependências
npm install

# Configurar .env (copie de .env.example e preencha)
cp .env.example .env

# Iniciar MongoDB local OU usar MongoDB Atlas

# Rodar em desenvolvimento (auto-reload)
npm run dev

# OU rodar em produção
npm start
```

**Backend estará em:** http://localhost:5000

### 2. Frontend

```bash
cd frontend

# Instalar dependências
npm install

# Rodar
npm start
```

**Frontend estará em:** http://localhost:3000

## 📡 API Endpoints

### Autenticação
- `POST /api/auth/register` - Registrar
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário (privado)
- `PUT /api/auth/update-password` - Mudar senha (privado)

### Usuário
- `GET /api/user/profile` - Ver perfil (privado)
- `PUT /api/user/profile` - Atualizar perfil (privado)
- `PUT /api/user/preferences` - Atualizar preferências (privado)
- `POST /api/user/progress` - Adicionar progresso (privado)
- `GET /api/user/progress` - Ver progresso (privado)

### Treino
- `POST /api/workout/generate` - Gerar treino (privado)
- `GET /api/workout/current` - Treino atual (privado)
- `GET /api/workout/today` - Treino de hoje (privado)
- `GET /api/workout/history` - Histórico (privado)
- `POST /api/workout/:id/complete` - Completar treino (privado)

## 🔐 Autenticação

O sistema usa **JWT (JSON Web Tokens)**:

1. Usuário faz login → recebe token
2. Token é salvo no localStorage
3. Todas as requisições privadas enviam o token no header:
   ```
   Authorization: Bearer SEU_TOKEN_AQUI
   ```

## 💾 MongoDB

### Local
```bash
# Instalar MongoDB Community Edition
# https://www.mongodb.com/try/download/community

# Rodar
mongod
```

### Cloud (MongoDB Atlas) - Recomendado
1. Criar conta: https://www.mongodb.com/cloud/atlas/register
2. Criar cluster gratuito
3. Pegar string de conexão
4. Adicionar no `.env`:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/gainyourmuscle
   ```

## 🏋️ Features

### ✅ Implementado

**Backend:**
- ✅ Sistema completo de autenticação (JWT)
- ✅ CRUD de usuários
- ✅ Gerador inteligente de treinos personalizados
- ✅ Sistema de progresso e histórico
- ✅ API REST documentada

**Frontend:**
- ⏳ Em desenvolvimento (estrutura criada)

### 🔮 Próximas Features

- [ ] Seção de Mobilidade
- [ ] Plano alimentar personalizado
- [ ] Upload de fotos de progresso
- [ ] Gráficos de evolução
- [ ] Sistema de conquistas/badges
- [ ] Comunidade (feed social)
- [ ] App mobile (React Native)

## 🎨 Design

Mantém a identidade visual motivacional:
- Cores vibrantes e energéticas
- Mensagens motivacionais
- Interface limpa e intuitiva
- Mobile-first (responsivo)

## 📚 Como Funciona o Gerador de Treinos

O algoritmo considera:

1. **Dias disponíveis** (3-6 dias/semana) → Define divisão (ABC, ABCD, etc)
2. **Experiência** → Seleciona exercícios apropriados
3. **Ambiente** (casa/academia) → Filtra por equipamento
4. **Tolerância à fadiga** → Ajusta séries e descanso
5. **Limitações físicas** → Evita exercícios complexos
6. **Duração preferida** → Ajusta volume de treino
7. **Disciplina** → Adapta frequência
8. **Variedade** → Rotaciona exercícios

**Resultado:** Treino 100% personalizado! 💪

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/NovaFeature`)
3. Commit (`git commit -m 'Adiciona NovaFeature'`)
4. Push (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

## 📝 Licença

MIT License - Sinta-se livre para usar e modificar!

## 👨‍💻 Autor

Desenvolvido com 💪 por Joao fanticheli

---

**Lembre-se:** O objetivo não é perfeição, é PROGRESSO!
Cada treino completo é uma vitória! 🎉
