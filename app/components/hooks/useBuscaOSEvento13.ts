import { useState } from "react";
import { apiService } from "../../services/api";
import { notifyError } from "../NotificationsProvider";
import { useApiError } from "./useApiError";

type OSEvento13Response = {
  numero_os: number;
  quantidade_os: number;
  ultima_divisao: number;
  saldo_divisoes: number;
};

/**
 * Hook específico para buscar informações da OS no Evento 13
 */
export const useBuscaOSEvento13 = () => {
  const [osInfo, setOsInfo] = useState<OSEvento13Response | null>(null);
  const [referencia, setReferencia] = useState<string | null>(null);
  const [erroBuscaOS, setErroBuscaOS] = useState<string | null>(null);
  const [buscandoOS, setBuscandoOS] = useState(false);
  const { getApiErrorMessage } = useApiError();

  const limparBuscaOS = () => {
    setOsInfo(null);
    setReferencia(null);
    setErroBuscaOS(null);
  };

  const consultarOS = async (
    numeroOS: string
  ): Promise<OSEvento13Response | null> => {
    const numero = numeroOS.trim();
    if (!numero) {
      setErroBuscaOS("Informe o número da OS para pesquisar.");
      limparBuscaOS();
      return null;
    }

    setErroBuscaOS(null);
    setBuscandoOS(true);

    try {
      const resposta = await apiService.get<OSEvento13Response>(
        `/ordens?numero_os=${encodeURIComponent(numero)}`
      );

      if (resposta) {
        // Verificar se o saldo é zero
        if (resposta.saldo_divisoes === 0) {
          setErroBuscaOS("OS não possui saldo disponível");
          notifyError("OS não possui saldo disponível");
          limparBuscaOS();
          return null;
        }

        setOsInfo(resposta);
        setReferencia(`OS ${resposta.numero_os}`);
        return resposta;
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

  return {
    osInfo,
    referencia,
    erroBuscaOS,
    buscandoOS,
    consultarOS,
    limparBuscaOS,
    setReferencia,
  };
};
