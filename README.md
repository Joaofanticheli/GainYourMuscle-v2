# 💪 GainYourMuscle v2.0

> Plataforma completa de fitness com geração de treinos por IA, plano nutricional personalizado e acompanhamento de progresso.

**🌐 Web:** https://gain-your-muscle-v2.vercel.app
**🔗 API:** https://gainyourmuscle-v2.onrender.com
**📱 Android:** APK disponível (build via Android Studio)
**🍎 iOS:** Instalável como PWA pelo Safari

---

## 🎯 Sobre o Projeto

GainYourMuscle é uma plataforma fitness que desmistifica a academia:

- Treinos personalizados gerados por IA com base no seu perfil
- Plano nutricional com macros, refeições e suplementação
- Acompanhamento de peso e medidas corporais
- Disponível na web, Android (APK) e iOS (PWA)

---

## 🛠️ Stack Tecnológica

### Frontend
- **React 19** — Interface do usuário
- **React Router 7** — Navegação SPA
- **Axios** — Requisições HTTP
- **Capacitor 8** — Empacotamento Android/PWA
- **CSS3** — Tema dark futurista responsivo

### Backend
- **Node.js + Express** — API REST
- **MongoDB Atlas + Mongoose** — Banco de dados na nuvem
- **JWT** — Autenticação stateless
- **bcryptjs** — Criptografia de senhas

### Deploy
- **Vercel** — Frontend (CI/CD automático via GitHub)
- **Render** — Backend (CI/CD automático via GitHub)

---

## ✅ Funcionalidades

### Autenticação
- Registro com dados pessoais e físicos
- Login com JWT (token válido por 7 dias)
- Atualização de senha
- Recuperação de senha

### Dashboard
- Resumo do treino do dia
- Ações rápidas
- Frase motivacional
- Estatísticas pessoais

### Gerador de Treinos (IA)
- Algoritmo personalizado por objetivo, frequência, ambiente e experiência
- Divisões: ABC, ABCD, ABCDE, Full Body
- Suporte a lesões e limitações físicas
- Esportes específicos
- Modo manual para treino personalizado

### Meu Treino
- Visualização completa do treino atual
- Treino de hoje com tracking de séries/reps/carga
- Check-in de conclusão
- Histórico de treinos

### Nutrição (IA)
- Plano nutricional gerado por IA
- Cálculo de calorias e macros (proteína, carbo, gordura)
- Refeições detalhadas com alimentos e quantidades
- Guia de suplementação
- Dicas nutricionais personalizadas

### Progresso
- Registro de peso e medidas corporais (braço, peito, cintura, quadril, coxa)
- Histórico completo de registros
- Vinculação com treino do dia
- Observações pessoais

### Perfil
- Dados pessoais e físicos
- Cálculo de IMC automático
- Edição de informações
- Atualização de senha

---

## 📱 Mobile

### Android (APK)
Gera o APK via Android Studio:
```bash
cd frontend
npm run build
npx cap sync android
# Abra o Android Studio → Build → Build APK(s)
```

### iOS / PWA
1. Abra o Safari no iPhone
2. Acesse https://gain-your-muscle-v2.vercel.app
3. Toque em **Compartilhar → Adicionar à Tela de Início**

---

## 📁 Estrutura do Projeto

```
GainYourMuscle-v2/
├── backend/
│   ├── config/           # Conexão MongoDB
│   ├── controllers/      # Lógica: auth, user, workout, nutrition
│   ├── middleware/       # Autenticação JWT
│   ├── models/           # Schemas: User, Workout
│   ├── routes/           # Rotas da API
│   ├── utils/            # Gerador de treinos
│   └── server.js         # Servidor Express
│
└── frontend/
    ├── public/
    │   ├── manifest.json  # PWA manifest
    │   └── service-worker.js  # Cache offline
    ├── src/
    │   ├── components/    # Navbar
    │   ├── context/       # AuthContext (estado global)
    │   ├── pages/         # Dashboard, Login, Perfil, Progresso...
    │   ├── services/      # api.js (Axios)
    │   └── styles/        # CSS por página
    └── android/           # Projeto Capacitor Android
```

---

## 📡 API Endpoints

### Autenticação
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/auth/register` | Criar conta |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Dados do usuário logado |
| PUT | `/api/auth/update-password` | Alterar senha |
| POST | `/api/auth/forgot-password` | Recuperar senha |

### Usuário
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/api/user/profile` | Ver perfil |
| PUT | `/api/user/profile` | Atualizar perfil |
| POST | `/api/user/progress` | Registrar progresso |
| GET | `/api/user/progress` | Histórico de progresso |
| DELETE | `/api/user/progress/:id` | Deletar registro |

### Treino
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/workout/generate` | Gerar treino com IA |
| GET | `/api/workout/current` | Treino atual |
| GET | `/api/workout/today` | Treino de hoje |
| GET | `/api/workout/history` | Histórico |
| POST | `/api/workout/:id/complete` | Marcar como concluído |
| DELETE | `/api/workout/:id` | Deletar treino |
| POST | `/api/workout/manual` | Salvar treino manual |

### Nutrição
| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/api/nutrition/generate` | Gerar plano nutricional com IA |
| GET | `/api/nutrition/plan` | Ver plano salvo |

---

## 🚀 Como Rodar Localmente

### 1. Backend
```bash
cd backend
npm install

# Criar arquivo .env
cp .env.example .env
# Preencher: MONGO_URI, JWT_SECRET, FRONTEND_URL

npm run dev
# Servidor em http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
npm start
# App em http://localhost:3000
```

---

## 🔐 Variáveis de Ambiente (Backend)

```env
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=sua_chave_secreta
JWT_EXPIRE=7d
FRONTEND_URL=https://gain-your-muscle-v2.vercel.app
NODE_ENV=production
```

---

## 👨‍💻 Autor

Desenvolvido por **Joao Fanticheli**

---

> O objetivo não é perfeição, é **PROGRESSO**! Cada treino completo é uma vitória! 🎉
