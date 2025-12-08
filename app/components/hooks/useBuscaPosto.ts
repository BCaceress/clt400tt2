import { useState } from "react";
import { apiService } from "../../services/api";
import { notifyError } from "../NotificationsProvider";
import { useApiError } from "./useApiError";

type Posto = {
  codigo_posto: string;
  descricao: string;
  situacao: string;
  situacao_descricao: string;
};

/**
 * Hook para busca de postos de trabalho
 */
export const useBuscaPosto = () => {
  const [descricaoPosto, setDescricaoPosto] = useState<string>("");
  const [erroPosto, setErroPosto] = useState<string | null>(null);
  const [buscandoPosto, setBuscandoPosto] = useState(false);
  const { getApiErrorMessage } = useApiError();

  const consultarPosto = async (codigo: string) => {
    const codigoLimpo = codigo.trim();
    if (!codigoLimpo) {
      setErroPosto("Informe o código do posto.");
      setDescricaoPosto("");
      return null;
    }

    setErroPosto(null);
    setBuscandoPosto(true);

    try {
      const resposta = await apiService.get<Posto[]>(
        `/postos?codigo_posto=${encodeURIComponent(codigoLimpo)}`
      );
      const postoEncontrado = resposta?.[0];

      if (postoEncontrado) {
        setDescricaoPosto(postoEncontrado.descricao);
        return postoEncontrado;
      } else {
        setDescricaoPosto("");
        setErroPosto("Posto não encontrado.");
        return null;
      }
    } catch (error) {
      console.error(error);
      const mensagem = getApiErrorMessage(
        error,
        "Não foi possível consultar o posto."
      );
      setErroPosto(mensagem);
      notifyError(mensagem);
      setDescricaoPosto("");
      return null;
    } finally {
      setBuscandoPosto(false);
    }
  };

  const limparPosto = () => {
    setDescricaoPosto("");
    setErroPosto(null);
  };

  return {
    descricaoPosto,
    erroPosto,
    buscandoPosto,
    consultarPosto,
    limparPosto,
  };
};
