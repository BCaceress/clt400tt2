import { useState } from "react";
import { apiService } from "../../services/api";
import { notifyError } from "../NotificationsProvider";
import { useApiError } from "./useApiError";

type Operador = {
  codigo_pessoa: string;
  nome?: string;
  situacao?: string;
};

/**
 * Hook para busca de operadores
 */
export const useBuscaOperador = () => {
  const [nomeOperador, setNomeOperador] = useState<string>("");
  const [erroOperador, setErroOperador] = useState<string | null>(null);
  const [buscandoOperador, setBuscandoOperador] = useState(false);
  const { getApiErrorMessage } = useApiError();

  const consultarOperador = async (codigo: string) => {
    const codigoLimpo = codigo.trim();
    if (!codigoLimpo) {
      setErroOperador("Informe o código do operador.");
      setNomeOperador("");
      return null;
    }

    setErroOperador(null);
    setBuscandoOperador(true);

    try {
      const resposta = await apiService.get<Operador | Operador[]>(
        `/operadores?codigo_pessoa=${encodeURIComponent(codigoLimpo)}`
      );
      const operador = Array.isArray(resposta) ? resposta[0] : resposta;

      if (operador && (operador.nome || operador.codigo_pessoa)) {
        const nome = operador.nome || "Operador encontrado";
        setNomeOperador(nome);
        return operador;
      } else {
        setNomeOperador("");
        setErroOperador("Operador não encontrado.");
        return null;
      }
    } catch (error) {
      console.error(error);
      const mensagem = getApiErrorMessage(
        error,
        "Não foi possível consultar o operador."
      );
      setErroOperador(mensagem);
      notifyError(mensagem);
      setNomeOperador("");
      return null;
    } finally {
      setBuscandoOperador(false);
    }
  };

  const limparOperador = () => {
    setNomeOperador("");
    setErroOperador(null);
  };

  return {
    nomeOperador,
    erroOperador,
    buscandoOperador,
    consultarOperador,
    limparOperador,
  };
};
