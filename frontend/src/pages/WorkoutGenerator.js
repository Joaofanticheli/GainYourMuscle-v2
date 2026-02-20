// ============================================================================
// PÁGINA GERADOR DE TREINO - Questionário e Geração
// ============================================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutAPI } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/WorkoutGenerator.css';

const WorkoutGenerator = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    diasTreino: '',
    experiencia: '',
    fadiga: '',
    lesao: '',
    duracao: '',
    disciplina: '',
    variedade: '',
    ambiente: '',
    muscular: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Converte diasTreino para número
      const params = {
        ...formData,
        diasTreino: parseInt(formData.diasTreino)
      };

      const response = await workoutAPI.generate(params);

      if (response.data.success) {
        alert('✅ ' + response.data.message);
        navigate('/meu-treino');
      }
    } catch (error) {
      setError(
        error.response?.data?.message || 'Erro ao gerar treino. Tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="workout-generator-container">
        <header className="generator-header">
          <h1>🏋️ Gerar Treino Personalizado</h1>
          <p>Responda o questionário para criarmos seu treino ideal!</p>
        </header>

        <div className="generator-content">
          <div className="generator-info">
            <h2>Por que este questionário?</h2>
            <p>
              Coletamos informações detalhadas sobre você para montar um treino
              realmente ideal, pensado de forma individual.
            </p>
            <p>
              O objetivo é garantir que o treino seja compatível com o seu nível
              físico, suas preferências, sua rotina e seus objetivos.
            </p>
            <p>
              Quando você começa a notar evolução, a motivação aumenta naturalmente,
              tornando o treino mais prazeroso e sustentável! 💪
            </p>
            <p className="generator-trust">
              <strong>Confie na gente!</strong>
            </p>
          </div>

          <form className="generator-form" onSubmit={handleSubmit}>
            {error && <div className="alert alert-error">{error}</div>}

            <fieldset>
              <legend>Responda para montar seu treino</legend>

              <div className="form-group">
                <label htmlFor="diasTreino">
                  Frequência semanal realista (dias/semana):
                </label>
                <select
                  id="diasTreino"
                  name="diasTreino"
                  value={formData.diasTreino}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Selecione</option>
                  <option value="3">3 dias</option>
                  <option value="4">4 dias</option>
                  <option value="5">5 dias</option>
                  <option value="6">6 dias</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="experiencia">
                  Experiência com musculação:
                </label>
                <select
                  id="experiencia"
                  name="experiencia"
                  value={formData.experiencia}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Selecione</option>
                  <option value="nunca">Nunca fiz</option>
                  <option value="novato">Novato (menos de 1 ano)</option>
                  <option value="intermediaria">Intermediário (1-3 anos)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="fadiga">Relação com fadiga:</label>
                <select
                  id="fadiga"
                  name="fadiga"
                  value={formData.fadiga}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Selecione</option>
                  <option value="evito">Evito ao máximo</option>
                  <option value="consigo">Consigo lidar</option>
                  <option value="nao">Não tenho problema</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="lesao">Limitações físicas atuais:</label>
                <select
                  id="lesao"
                  name="lesao"
                  value={formData.lesao}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Selecione</option>
                  <option value="nenhuma">Nenhuma</option>
                  <option value="leve">Leve desconforto</option>
                  <option value="pequena">Lesão pequena</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="duracao">
                  Preferência de duração do treino:
                </label>
                <select
                  id="duracao"
                  name="duracao"
                  value={formData.duracao}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Selecione</option>
                  <option value="curto">45 minutos</option>
                  <option value="normal">1 hora</option>
                  <option value="longo">2 horas</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="disciplina">
                  Nível de disciplina (quantas vezes você falta no treino):
                </label>
                <select
                  id="disciplina"
                  name="disciplina"
                  value={formData.disciplina}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Selecione</option>
                  <option value="frequentemente">Frequentemente</option>
                  <option value="intermediario">Às vezes</option>
                  <option value="raramente">Raramente</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="variedade">Preferência por variedade:</label>
                <select
                  id="variedade"
                  name="variedade"
                  value={formData.variedade}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Selecione</option>
                  <option value="gosto">Gosto de variar</option>
                  <option value="nao">Não gosto de variar</option>
                  <option value="intermediario">Gosto que varie um pouco</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="ambiente">Ambiente principal:</label>
                <select
                  id="ambiente"
                  name="ambiente"
                  value={formData.ambiente}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Selecione</option>
                  <option value="casa">Em casa</option>
                  <option value="pequena">Academia pequena</option>
                  <option value="grande">Academia grande</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="muscular">
                  Tolerância a desconforto muscular na rotina:
                </label>
                <select
                  id="muscular"
                  name="muscular"
                  value={formData.muscular}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="">Selecione</option>
                  <option value="atrapalharia">Atrapalharia muito</option>
                  <option value="pouco">Atrapalharia um pouco</option>
                  <option value="nao">Não atrapalharia</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-block btn-large"
                disabled={loading}
              >
                {loading ? '⏳ Gerando seu treino...' : '🚀 Gerar Meu Treino'}
              </button>
            </fieldset>
          </form>
        </div>
      </div>
    </div>
  );
};

export default WorkoutGenerator;
