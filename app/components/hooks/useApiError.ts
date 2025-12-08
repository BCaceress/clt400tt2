/**
 * Hook para tratamento padronizado de erros da API
 */
export const useApiError = () => {
  const getApiErrorMessage = (error: unknown, fallback: string): string => {
    if (error && typeof error === "object") {
      const status = (error as { status?: number }).status;
      const message = (error as { message?: string }).message;

      if (status && [400, 402, 404].includes(status) && message) {
        const cleaned = message.replace(/^HTTP\s*\d+:\s*/i, "").trim();
        return cleaned || fallback;
      }

      if (message) {
        return message;
      }
    }

    return fallback;
  };

  return { getApiErrorMessage };
};
