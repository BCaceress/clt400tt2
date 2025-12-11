import { useState } from "react";
import { apiService } from "../../services/api";
import { notifyError } from "../NotificationsProvider";
import { useApiError } from "./useApiError";

export type ServicoInspecao = {
  sequencial_servico: number;
  tipo_servico: string;
  descricao_servico: string;
  codigo_processo: number;
  descricao_processo: string;
  unidade_medida: string;
  programar: string;
};

/**
 * Hook para busca de Serviços de Inspeção baseado no número da OS
 */
export const useBuscaServicosInspecao = () => {
  const [servicosInfo, setServicosInfo] = useState<ServicoInspecao[] | null>(
    null
  );
  const [servicoSelecionado, setServicoSelecionado] =
    useState<ServicoInspecao | null>(null);
  const [referencia, setReferencia] = useState<string | null>(null);
  const [erroBuscaServicos, setErroBuscaServicos] = useState<string | null>(
    null
  );
  const [buscandoServicos, setBuscandoServicos] = useState(false);

  const { getApiErrorMessage } = useApiError();

  const consultarServicos = async (numeroOS: string): Promise<boolean> => {
    if (!numeroOS.trim()) {
      setErroBuscaServicos("Número da OS é obrigatório");
      return false;
    }

    setBuscandoServicos(true);
    setErroBuscaServicos(null);
    setServicosInfo(null);
    setServicoSelecionado(null);

    try {
      const response = await apiService.get<ServicoInspecao[]>(
        `/servicos_inspecao?numero_os=${numeroOS}`
      );

      if (response && Array.isArray(response) && response.length > 0) {
        setServicosInfo(response);
        setReferencia(
          `OS ${numeroOS} - ${response.length} serviço(s) encontrado(s)`
        );
        return true;
      } else {
        setErroBuscaServicos(
          "Nenhum serviço de inspeção encontrado para esta OS"
        );
        setReferencia(null);
        return false;
      }
    } catch (error) {
      console.error("Erro ao buscar serviços de inspeção:", error);
      const mensagemErro = getApiErrorMessage(
        error,
        "Erro ao buscar serviços de inspeção"
      );
      setErroBuscaServicos(mensagemErro);
      setReferencia(null);
      notifyError(`Erro ao buscar:\n${mensagemErro}`);
      return false;
    } finally {
      setBuscandoServicos(false);
    }
  };

  const selecionarServico = (servico: ServicoInspecao | null) => {
    setServicoSelecionado(servico);
  };

  const limparDados = () => {
    setServicosInfo(null);
    setServicoSelecionado(null);
    setReferencia(null);
    setErroBuscaServicos(null);
  };

  return {
    servicosInfo,
    servicoSelecionado,
    referencia,
    erroBuscaServicos,
    buscandoServicos,
    consultarServicos,
    selecionarServico,
    setReferencia,
    limparDados,
  };
};
