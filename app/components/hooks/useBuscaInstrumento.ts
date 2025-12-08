import { useState } from "react";
import { apiService } from "../../services/api";
import { notifyError } from "../NotificationsProvider";
import { useApiError } from "./useApiError";

type Instrumento = {
  codigo_instrumento: string;
  descricao?: string;
  situacao?: string;
};

/**
 * Hook para busca de instrumentos
 */
export const useBuscaInstrumento = () => {
  const [descricaoInstrumento, setDescricaoInstrumento] = useState<string>("");
  const [erroInstrumento, setErroInstrumento] = useState<string | null>(null);
  const [buscandoInstrumento, setBuscandoInstrumento] = useState(false);
  const { getApiErrorMessage } = useApiError();

  const consultarInstrumento = async (codigo: string) => {
    const codigoLimpo = codigo.trim();
    if (!codigoLimpo) {
      setErroInstrumento("Informe o código do instrumento.");
      setDescricaoInstrumento("");
      return null;
    }

    setErroInstrumento(null);
    setBuscandoInstrumento(true);

    try {
      const resposta = await apiService.get<Instrumento | Instrumento[]>(
        `/instrumentos?codigo_instrumento=${encodeURIComponent(codigoLimpo)}`
      );
      const instrumento = Array.isArray(resposta) ? resposta[0] : resposta;

      if (
        instrumento &&
        (instrumento.descricao || instrumento.codigo_instrumento)
      ) {
        const descricao = instrumento.descricao || "Instrumento encontrado";
        setDescricaoInstrumento(descricao);
        return instrumento;
      } else {
        setDescricaoInstrumento("");
        setErroInstrumento("Instrumento não encontrado.");
        return null;
      }
    } catch (error) {
      console.error(error);
      const mensagem = getApiErrorMessage(
        error,
        "Não foi possível consultar o instrumento."
      );
      setErroInstrumento(mensagem);
      notifyError(mensagem);
      setDescricaoInstrumento("");
      return null;
    } finally {
      setBuscandoInstrumento(false);
    }
  };

  const limparInstrumento = () => {
    setDescricaoInstrumento("");
    setErroInstrumento(null);
  };

  return {
    descricaoInstrumento,
    erroInstrumento,
    buscandoInstrumento,
    consultarInstrumento,
    limparInstrumento,
  };
};
