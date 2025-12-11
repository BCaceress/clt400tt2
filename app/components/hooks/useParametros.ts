import { useState, useEffect } from "react";
import { apiService } from "../../services/api";

interface Parametros {
  nome_empresa: string;
  altera_data: boolean;
}

const PARAMETROS_STORAGE_KEY = "clt400tt_parametros";

// Cache global para evitar múltiplas chamadas à API
let globalParametros: Parametros | null = null;
let globalLoading = false;
let apiCallPromise: Promise<Parametros> | null = null;

export function useParametros() {
  const [parametros, setParametros] = useState<Parametros | null>(
    globalParametros
  );
  const [loading, setLoading] = useState(!globalParametros && !globalLoading);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarParametros() {
      try {
        // Se já temos os parâmetros globais, usa eles
        if (globalParametros) {
          setParametros(globalParametros);
          setLoading(false);
          return;
        }

        // Se já está carregando, espera a promise existente
        if (apiCallPromise) {
          const resultado = await apiCallPromise;
          setParametros(resultado);
          setLoading(false);
          return;
        }

        setLoading(true);
        setError(null);
        globalLoading = true;

        // Primeiro verifica se já existe no localStorage
        const parametrosStorage = localStorage.getItem(PARAMETROS_STORAGE_KEY);
        if (parametrosStorage) {
          try {
            const parametrosParseados = JSON.parse(
              parametrosStorage
            ) as Parametros;
            globalParametros = parametrosParseados;
            setParametros(parametrosParseados);
          } catch {
            // Se der erro ao parsear, remove do localStorage
            localStorage.removeItem(PARAMETROS_STORAGE_KEY);
          }
        }

        // Cria a promise da chamada à API para evitar múltiplas chamadas
        apiCallPromise = apiService.get<Parametros>("/parametros");
        const response = await apiCallPromise;

        // Salva no cache global e localStorage
        globalParametros = response;
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
            globalParametros = parametrosParseados;
            setParametros(parametrosParseados);
          } catch {
            localStorage.removeItem(PARAMETROS_STORAGE_KEY);
          }
        }
      } finally {
        setLoading(false);
        globalLoading = false;
        // Limpa a promise após completar
        apiCallPromise = null;
      }
    }

    carregarParametros();
  }, []);

  const atualizarParametros = async () => {
    try {
      setError(null);
      // Força uma nova chamada à API
      apiCallPromise = null;
      const response = await apiService.get<Parametros>("/parametros");

      // Atualiza o cache global e localStorage
      globalParametros = response;
      localStorage.setItem(PARAMETROS_STORAGE_KEY, JSON.stringify(response));
      setParametros(response);
      return response;
    } catch (err) {
      console.error("Erro ao atualizar parâmetros:", err);
      setError("Erro ao atualizar parâmetros da empresa");
      throw err;
    }
  };

  const limparCache = () => {
    globalParametros = null;
    globalLoading = false;
    apiCallPromise = null;
    localStorage.removeItem(PARAMETROS_STORAGE_KEY);
  };

  return {
    parametros,
    loading,
    error,
    atualizarParametros,
    limparCache,
  };
}
