# 🚀 GUIA DE DESENVOLVIMENTO - GainYourMuscle v2

## ✅ O QUE FOI CRIADO

### 🎯 BACKEND COMPLETO (100%)

```
backend/
├── config/
│   └── db.js                    ✅ Conexão MongoDB
├── controllers/
│   ├── authController.js        ✅ Login, Register, Auth
│   ├── userController.js        ✅ Perfil, Preferências, Progresso
│   └── workoutController.js     ✅ Geração e gestão de treinos
├── middleware/
│   └── auth.js                  ✅ Proteção de rotas (JWT)
├── models/
│   ├── User.js                  ✅ Schema de usuário completo
│   └── Workout.js               ✅ Schema de treino completo
├── routes/
│   ├── auth.js                  ✅ Rotas de autenticação
│   ├── user.js                  ✅ Rotas de usuário
│   └── workout.js               ✅ Rotas de treino
├── utils/
│   └── workoutGenerator.js      ✅ Gerador inteligente de treinos
├── server.js                    ✅ Servidor Express
├── .env                         ✅ Variáveis de ambiente
└── package.json                 ✅ Dependências

TOTAL: 14 arquivos criados e funcionais!
```

### 🎨 FRONTEND BASE (70%)

```
frontend/
├── src/
│   ├── services/
│   │   └── api.js               ✅ Serviço de API (todas as rotas)
│   ├── context/
│   │   └── AuthContext.js       ✅ Gerenciamento de autenticação
│   ├── components/              ⏳ Para você criar
│   ├── pages/                   ⏳ Para você criar
│   └── App.js                   ⏳ Para você atualizar
└── package.json                 ✅ Dependências instaladas
```

---

## 🏃 COMO RODAR O PROJETO

### 1. Configurar MongoDB

**Opção A: MongoDB Local**
```bash
# Instalar: https://www.mongodb.com/try/download/community
# Rodar
mongod
```

**Opção B: MongoDB Atlas (Cloud - Recomendado)**
1. Criar conta: https://www.mongodb.com/cloud/atlas/register
2. Criar cluster gratuito
3. Obter string de conexão
4. Colocar no `backend/.env`:
   ```
   MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/gainyourmuscle
   ```

### 2. Rodar Backend

```bash
cd backend
npm run dev
```

Deve aparecer:
```
✅ Conectado ao MongoDB
🚀 Servidor rodando em: http://localhost:5000
```

### 3. Rodar Frontend

```bash
cd frontend
npm start
```

Abrirá em: http://localhost:3000

---

## 📋 PRÓXIMOS PASSOS PARA COMPLETAR

### Frontend - O que você precisa criar:

#### 1. **Páginas Principais** (`src/pages/`)

**Home.js** - Página inicial motivacional
```jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="home">
      <h1>GainYourMuscle</h1>
      <h2>Melhore seu estilo de vida!</h2>
      <p>Está pronto para mudar?</p>
      <button onClick={() => navigate('/register')}>
        Sim, quero começar!
      </button>
      <button onClick={() => navigate('/login')}>
        Já tenho conta
      </button>
    </div>
  );
};

export default Home;
```

**Login.js** - Página de login
```jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, senha);
      navigate('/dashboard');
    } catch (error) {
      alert('Erro no login: ' + error.response?.data?.message);
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
```

**Register.js** - Cadastro (adapte do form original)

**Dashboard.js** - Painel principal do usuário logado

**WorkoutGenerator.js** - Formulário de geração de treino (use o questionário do projeto antigo)

**WorkoutView.js** - Visualizar treino gerado

#### 2. **Componentes** (`src/components/`)

- `Navbar.js` - Menu de navegação
- `PrivateRoute.js` - Proteção de rotas privadas
- `ExerciseCard.js` - Card de exercício
- `ProgressChart.js` - Gráfico de progresso

#### 3. **App.js** - Configurar rotas

```jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Páginas
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import WorkoutGenerator from './pages/WorkoutGenerator';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/gerar-treino" element={<WorkoutGenerator />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
```

---

## 🎨 REUTILIZAR DO PROJETO ANTIGO

Você pode **reaproveitar**:
- ✅ Todo o **CSS** (`style.css`)
- ✅ Layout do **questionário** de treino
- ✅ Textos **motivacionais**
- ✅ Estrutura visual das páginas

**Como migrar:**
1. Copie o CSS para `frontend/src/App.css`
2. Adapte o HTML para JSX (componentes React)
3. Troque `getElementById` por `useState` e `useEffect`

---

## 🧪 TESTANDO A API

Use **Postman** ou **Insomnia**:

### 1. Registrar usuário
```
POST http://localhost:5000/api/auth/register

Body (JSON):
{
  "email": "teste@email.com",
  "password": "123456",
  "nome": "João",
  "idade": 25,
  "sexo": "masculino",
  "peso": 75,
  "altura": 175,
  "frequencia": 3
}
```

### 2. Login
```
POST http://localhost:5000/api/auth/login

Body:
{
  "email": "teste@email.com",
  "password": "123456"
}

Resposta:
{
  "success": true,
  "token": "eyJhbGc...",
  "user": {...}
}
```

### 3. Gerar treino (precisa do token)
```
POST http://localhost:5000/api/workout/generate
Authorization: Bearer SEU_TOKEN_AQUI

Body:
{
  "diasTreino": 4,
  "experiencia": "novato",
  "fadiga": "consigo",
  "lesao": "nenhuma",
  "duracao": "normal",
  "disciplina": "intermediario",
  "variedade": "intermediario",
  "ambiente": "grande",
  "muscular": "pouco"
}
```

---

## 💡 DICAS DE DESENVOLVIMENTO

### Ordem recomendada:

1. ✅ Teste o backend (Postman/Insomnia)
2. ⏳ Crie página de Login
3. ⏳ Crie página de Register
4. ⏳ Crie Dashboard simples
5. ⏳ Migre questionário de treino
6. ⏳ Conecte com API de geração
7. ⏳ Mostre treino gerado
8. ⏳ Adicione estilos
9. ⏳ Deploy!

### Debug comum:

**Erro de CORS:**
```
Access to XMLHttpRequest blocked by CORS
```
**Solução:** Já está configurado no backend! Certifique-se de que o frontend está em `localhost:3000`.

**Token expirado:**
```
Token inválido ou expirado
```
**Solução:** Faça login novamente.

---

## 🚀 DEPLOY (Quando estiver pronto)

### Backend
- **Render.com** (gratuito)
- **Railway.app**
- **Heroku**

### Frontend
- **Vercel** (gratuito, deploy automático com Git)
- **Netlify**
- **GitHub Pages**

---

## 📚 RECURSOS PARA APRENDER

### React
- Documentação: https://react.dev/
- Tutorial interativo: https://react.dev/learn

### MongoDB
- Universidade MongoDB (gratuito): https://university.mongodb.com/

### Deploy
- Vercel: https://vercel.com/docs
- Render: https://render.com/docs

---

## 🎯 RESUMO DO QUE VOCÊ TEM

✅ **Backend API completa e funcional**
✅ **Autenticação JWT segura**
✅ **Gerador inteligente de treinos**
✅ **Banco de dados MongoDB**
✅ **Base React configurada**
✅ **Serviço de API pronto**
✅ **Context de autenticação**

**Falta:** Criar as páginas React e conectar tudo!

---

## ❓ DÚVIDAS COMUNS

**Q: Preciso pagar pelo MongoDB?**
A: Não! MongoDB Atlas tem tier gratuito (512MB).

**Q: Preciso saber muito React?**
A: Não! O básico de componentes e hooks já funciona. Use o projeto antigo como base.

**Q: Como adiciono mais exercícios?**
A: Edite `backend/utils/workoutGenerator.js` → `exerciciosDB`

**Q: Posso mudar o algoritmo de treino?**
A: Sim! Está tudo em `workoutGenerator.js`, muito bem comentado.

---

**Sucesso no desenvolvimento! 💪**

Qualquer dúvida, leia os comentários no código - está TUDO explicado em português!
