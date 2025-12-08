import { useState } from "react";
import { apiService } from "../../services/api";
import { notifyError } from "../NotificationsProvider";
import { useApiError } from "./useApiError";

type Servico = {
  codigo_servico: string;
  descricao?: string;
  situacao?: string;
};

/**
 * Hook para busca de serviços
 */
export const useBuscaServico = () => {
  const [descricaoServico, setDescricaoServico] = useState<string>("");
  const [erroServico, setErroServico] = useState<string | null>(null);
  const [buscandoServico, setBuscandoServico] = useState(false);
  const { getApiErrorMessage } = useApiError();

  const consultarServico = async (codigo: string) => {
    const codigoLimpo = codigo.trim();
    if (!codigoLimpo) {
      setErroServico("Informe o código do serviço.");
      setDescricaoServico("");
      return null;
    }

    setErroServico(null);
    setBuscandoServico(true);

    try {
      const resposta = await apiService.get<Servico | Servico[]>(
        `/servicos?codigo_servico=${encodeURIComponent(codigoLimpo)}`
      );
      const servico = Array.isArray(resposta) ? resposta[0] : resposta;

      if (servico && (servico.descricao || servico.codigo_servico)) {
        const descricao = servico.descricao || "Serviço encontrado";
        setDescricaoServico(descricao);
        return servico;
      } else {
        setDescricaoServico("");
        setErroServico("Serviço não encontrado.");
        return null;
      }
    } catch (error) {
      console.error(error);
      const mensagem = getApiErrorMessage(
        error,
        "Não foi possível consultar o serviço."
      );
      setErroServico(mensagem);
      notifyError(mensagem);
      setDescricaoServico("");
      return null;
    } finally {
      setBuscandoServico(false);
    }
  };

  const limparServico = () => {
    setDescricaoServico("");
    setErroServico(null);
  };

  return {
    descricaoServico,
    erroServico,
    buscandoServico,
    consultarServico,
    limparServico,
  };
};
