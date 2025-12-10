import { useState } from "react";
import { apiService } from "../../services/api";
import { notifyError } from "../NotificationsProvider";
import { useApiError } from "./useApiError";

type OrdemBusca = {
  numero_os?: number | string;
  cliente?: string;
  descricao?: string;
  status?: string;
};

type PostoPossivel = {
  codigo: string;
  descricao: string;
};

type OrdemApiResponse = {
  numero_os: number;
  quantidade_os: number;
  numero_carga?: number;
  posto?: string;
  descricao_posto?: string;
  postos_possiveis?: PostoPossivel[];
  cargas_prioritarias?: string;
  divisoes: Array<{
    numero_os?: number;
    divisao: number;
    quantidade: number;
  }>;
};

/**
 * Hook para busca de Ordens de Serviço
 */
export const useBuscaOS = () => {
  const [osInfo, setOsInfo] = useState<OrdemBusca | null>(null);
  const [referencia, setReferencia] = useState<string | null>(null);
  const [erroBuscaOS, setErroBuscaOS] = useState<string | null>(null);
  const [buscandoOS, setBuscandoOS] = useState(false);
  const { getApiErrorMessage } = useApiError();

  const limparBuscaOS = () => {
    setOsInfo(null);
    setReferencia(null);
    setErroBuscaOS(null);
  };

  const consultarOS = async (numeroOS: string) => {
    const numero = numeroOS.trim();
    if (!numero) {
      setErroBuscaOS("Informe o número da OS para pesquisar.");
      limparBuscaOS();
      return null;
    }

    setErroBuscaOS(null);
    setBuscandoOS(true);

    try {
      const resposta = await apiService.get<OrdemBusca | OrdemBusca[]>(
        `/ordens?numero_os=${encodeURIComponent(numero)}`
      );
      const ordemEncontrada = Array.isArray(resposta) ? resposta[0] : resposta;

      if (ordemEncontrada) {
        setOsInfo(ordemEncontrada);
        setReferencia(`OS ${ordemEncontrada.numero_os ?? numero}`);
        return ordemEncontrada;
      } else {
        setOsInfo(null);
        setReferencia(null);
        setErroBuscaOS("Nenhuma informação encontrada para a OS informada.");
        return null;
      }
    } catch (error) {
      console.error(error);
      const mensagem = getApiErrorMessage(
        error,
        "Não foi possível consultar a OS."
      );
      setErroBuscaOS(mensagem);
      notifyError(mensagem);
      limparBuscaOS();
      return null;
    } finally {
      setBuscandoOS(false);
    }
  };

  const consultarOSCompleta = async (numeroOS: string) => {
    const numero = numeroOS.trim();
    if (!numero) {
      setErroBuscaOS("Informe o número da OS para pesquisar.");
      return {
        linhas: [],
        referencia: null,
        posto: undefined,
        descricaoPosto: undefined,
        postosPossiveis: undefined,
        numeroCarga: undefined,
        cargasPrioritarias: undefined,
      };
    }

    setErroBuscaOS(null);
    setBuscandoOS(true);

    try {
      const resposta = await apiService.get<OrdemApiResponse>(
        `/cargas?numero_os=${encodeURIComponent(numero)}`
      );
      const dados = resposta.divisoes ?? [];
      const linhasComNumeroOS = dados.map((linha) => ({
        ...linha,
        numero_os: resposta.numero_os,
      }));

      const referenciaTexto = `OS ${resposta.numero_os}`;
      setReferencia(referenciaTexto);

      if (dados.length === 0) {
        setErroBuscaOS("Nenhuma divisão encontrada para a OS informada.");
      }

      return {
        linhas: linhasComNumeroOS,
        referencia: referenciaTexto,
        posto: resposta.posto,
        descricaoPosto: resposta.descricao_posto,
        postosPossiveis: resposta.postos_possiveis,
        numeroCarga: resposta.numero_carga,
        cargasPrioritarias: resposta.cargas_prioritarias,
      };
    } catch (error) {
      console.error(error);
      const mensagem = getApiErrorMessage(
        error,
        "Não foi possível consultar a OS."
      );
      setErroBuscaOS(mensagem);
      notifyError(mensagem);
      return {
        linhas: [],
        referencia: null,
        posto: undefined,
        descricaoPosto: undefined,
        postosPossiveis: undefined,
        numeroCarga: undefined,
        cargasPrioritarias: undefined,
      };
    } finally {
      setBuscandoOS(false);
    }
  };

  return {
    osInfo,
    referencia,
    erroBuscaOS,
    buscandoOS,
    consultarOS,
    consultarOSCompleta,
    limparBuscaOS,
    setReferencia,
  };
};
