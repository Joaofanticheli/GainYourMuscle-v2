import { useState, useEffect } from 'react';

const API = process.env.REACT_APP_API_URL || 'https://gainyourmuscle-v2.onrender.com';

export const useProfissional = (token) => {
  const [vinculos, setVinculos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/api/profissional/meus-vinculos`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => { if (data.success) setVinculos(data.vinculos); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  const ativos = vinculos.filter(v => v.status === 'ativo');
  const temIA = ativos.some(v => v.profissional?.profissional?.isAI);
  const profissionalHumano = ativos.find(v => !v.profissional?.profissional?.isAI)?.profissional || null;

  return { ativos, temIA, temProfissional: ativos.length > 0, profissionalHumano, loading };
};
