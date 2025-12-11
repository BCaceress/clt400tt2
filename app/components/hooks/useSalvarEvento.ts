import { useState } from "react";
import { apiService } from "../../services/api";
import { notifySuccess, notifyError } from "../NotificationsProvider";
import { useApiError } from "./useApiError";

/**
 * Tipo para o payload de salvamento de eventos
 */
type EventoPayload = {
  // Formato antigo (mantido para compatibilidade)
  numero_os?: string | number;
  numero_carga?: number;
  codigo_servico?: string;
  codigo_pessoa?: string;
  codigo_instrumento?: string;
  codigo_forno?: string;
  resultado?: string;
  tipo_lcto?: string;

  // Formato novo
  evento?: string;
  posto?: string;
  operador?: string;
  data_hora?: string;
  divisao?: string | number;

  [key: string]: string | number | undefined;
};

/**
 * Hook para salvamento de eventos
 */
export const useSalvarEvento = () => {
  const [salvando, setSalvando] = useState(false);
  const { getApiErrorMessage } = useApiError();

  const salvarEvento = async (
    payload: EventoPayload,
    titulo: string,
    dataHoraCustomizada?: string
  ) => {
    setSalvando(true);

    try {
      const payloadComData = {
        ...payload,
        ...(dataHoraCustomizada && { data_hora: dataHoraCustomizada }),
      };

      const response = (await apiService.post(
        "/lancamentos",
        payloadComData
      )) as {
        sucesso?: boolean;
        mensagem?: string;
      };

      if (response?.sucesso || response?.mensagem) {
        notifySuccess(response.mensagem || `${titulo} salvo!`);
        return true;
      } else {
        notifySuccess(`${titulo} salvo!`);
        return true;
      }
    } catch (error: unknown) {
      console.error(error);

      let errorMessage = "Não foi possível salvar o evento.";

      if (error && typeof error === "object" && "response" in error) {
        const apiError = error as {
          response: { data: { erro?: string; mensagem?: string } };
        };
        if (apiError.response?.data?.erro) {
          errorMessage = apiError.response.data.erro;
        } else if (apiError.response?.data?.mensagem) {
          errorMessage = apiError.response.data.mensagem;
        }
      } else if (error && typeof error === "object" && "message" in error) {
        const basicError = error as { message: string };
        errorMessage = basicError.message;
      }

      errorMessage = getApiErrorMessage(error, errorMessage);
      notifyError(errorMessage);
      return false;
    } finally {
      setSalvando(false);
    }
  };

  return {
    salvando,
    salvarEvento,
  };
};
