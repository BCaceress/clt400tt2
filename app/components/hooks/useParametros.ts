import { useState, useEffect } from "react";
import { apiService } from "../../services/api";

interface Parametros {
  nome_empresa: string;
  altera_data: boolean;
}

const PARAMETROS_STORAGE_KEY = "clt400tt_parametros";

export function useParametros() {
  const [parametros, setParametros] = useState<Parametros | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarParametros() {
      try {
        setLoading(true);
        setError(null);

        // Primeiro verifica se já existe no localStorage
        const parametrosStorage = localStorage.getItem(PARAMETROS_STORAGE_KEY);
        if (parametrosStorage) {
          try {
            const parametrosParseados = JSON.parse(
              parametrosStorage
            ) as Parametros;
            setParametros(parametrosParseados);
          } catch {
            // Se der erro ao parsear, remove do localStorage
            localStorage.removeItem(PARAMETROS_STORAGE_KEY);
          }
        }

        // Busca os parâmetros atualizados da API
        const response = await apiService.get<Parametros>("/parametros");

        // Salva no localStorage
        localStorage.setItem(PARAMETROS_STORAGE_KEY, JSON.stringify(response));

        // Atualiza o estado
        setParametros(response);
      } catch (err) {
        console.error("Erro ao carregar parâmetros:", err);
        setError("Erro ao carregar parâmetros da empresa");

        // Se a API falhar, tenta usar os dados do localStorage
        const parametrosStorage = localStorage.getItem(PARAMETROS_STORAGE_KEY);
        if (parametrosStorage) {
          try {
            const parametrosParseados = JSON.parse(
              parametrosStorage
            ) as Parametros;
            setParametros(parametrosParseados);
          } catch {
            localStorage.removeItem(PARAMETROS_STORAGE_KEY);
          }
        }
      } finally {
        setLoading(false);
      }
    }

    carregarParametros();
  }, []);

  const atualizarParametros = async () => {
    try {
      setError(null);
      const response = await apiService.get<Parametros>("/parametros");
      localStorage.setItem(PARAMETROS_STORAGE_KEY, JSON.stringify(response));
      setParametros(response);
      return response;
    } catch (err) {
      console.error("Erro ao atualizar parâmetros:", err);
      setError("Erro ao atualizar parâmetros da empresa");
      throw err;
    }
  };

  return {
    parametros,
    loading,
    error,
    atualizarParametros,
  };
}
