/**
 * Hook para formatação de data e hora
 */
export const useDateTime = () => {
  const formatarDataHoraAtual = (): string => {
    const agora = new Date();
    const pad = (valor: number) => valor.toString().padStart(2, "0");

    const dia = pad(agora.getDate());
    const mes = pad(agora.getMonth() + 1);
    const ano = agora.getFullYear();
    const hora = pad(agora.getHours());
    const minuto = pad(agora.getMinutes());
    const segundo = pad(agora.getSeconds());

    return `${dia}/${mes}/${ano} ${hora}:${minuto}:${segundo}`;
  };

  return { formatarDataHoraAtual };
};
