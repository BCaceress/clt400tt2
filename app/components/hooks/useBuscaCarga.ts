import { useState } from "react";
import { apiService } from "../../services/api";
import { notifyError } from "../NotificationsProvider";
import { useApiError } from "./useApiError";

type CargaApiResponse = {
  numero_carga: number;
  oss: Array<{
    numero_os?: number;
    divisao: number;
    quantidade: number;
  }>;
};

/**
 * Hook para busca de cargas (específico para Evento1015)
 */
export const useBuscaCarga = () => {
  const [erroBuscaCarga, setErroBuscaCarga] = useState<string | null>(null);
  const [buscandoCarga, setBuscandoCarga] = useState(false);
  const { getApiErrorMessage } = useApiError();

  const consultarCarga = async (numeroCarga: string) => {
    const numero = numeroCarga.trim();
    if (!numero) {
      setErroBuscaCarga("Informe o número da carga para pesquisar.");
      return { linhas: [], referencia: null };
    }

    setErroBuscaCarga(null);
    setBuscandoCarga(true);

    try {
      const resposta = await apiService.get<CargaApiResponse>(
        `/cargas?numero_carga=${encodeURIComponent(numero)}`
      );
      const dados = resposta.oss ?? [];
      const referencia = `Carga ${resposta.numero_carga}`;

      if (dados.length === 0) {
        setErroBuscaCarga("Nenhuma OS encontrada para a carga informada.");
      }

      return { linhas: dados, referencia };
    } catch (error) {
      console.error(error);
      const mensagem = getApiErrorMessage(
        error,
        "Não foi possível consultar a carga."
      );
      setErroBuscaCarga(mensagem);
      notifyError(mensagem);
      return { linhas: [], referencia: null };
    } finally {
      setBuscandoCarga(false);
    }
  };

  return {
    erroBuscaCarga,
    buscandoCarga,
    consultarCarga,
  };
};
