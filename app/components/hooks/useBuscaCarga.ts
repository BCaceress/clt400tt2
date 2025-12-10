import { useState } from "react";
import { apiService } from "../../services/api";
import { notifyError } from "../NotificationsProvider";
import { useApiError } from "./useApiError";

type PostoPossivel = {
  codigo: string;
  descricao: string;
};

type CargaApiResponse = {
  numero_carga: number;
  posto?: string;
  descricao_posto?: string;
  postos_possiveis?: PostoPossivel[];
  cargas_prioritarias?: string;
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
      return {
        linhas: [],
        referencia: null,
        posto: undefined,
        descricaoPosto: undefined,
        postosPossiveis: undefined,
      };
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

      return {
        linhas: dados,
        referencia,
        posto: resposta.posto,
        descricaoPosto: resposta.descricao_posto,
        postosPossiveis: resposta.postos_possiveis,
        cargasPrioritarias: resposta.cargas_prioritarias,
      };
    } catch (error) {
      console.error("Erro ao buscar carga:", error);
      const mensagem = getApiErrorMessage(
        error,
        "Não foi possível consultar a carga."
      );

      // Log adicional para debug
      if (error instanceof Error) {
        console.log("Detalhes do erro:", {
          message: error.message,
          status: (error as any).status,
          url: `/cargas?numero_carga=${encodeURIComponent(numero)}`,
        });
      }

      setErroBuscaCarga(mensagem);
      notifyError(mensagem);
      return {
        linhas: [],
        referencia: null,
        posto: undefined,
        descricaoPosto: undefined,
        postosPossiveis: undefined,
        cargasPrioritarias: undefined,
      };
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
