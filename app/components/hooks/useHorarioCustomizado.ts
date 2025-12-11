import { useState, useCallback } from "react";

interface HorarioCustomizado {
  dataHora: string; // formato ISO string
  alterado: boolean;
}

export function useHorarioCustomizado() {
  const [horarioCustomizado, setHorarioCustomizado] =
    useState<HorarioCustomizado>({
      dataHora: "",
      alterado: false,
    });

  const ajustarHorario = useCallback((novaDataHora: string) => {
    setHorarioCustomizado({
      dataHora: novaDataHora,
      alterado: true,
    });
  }, []);

  const limparHorario = useCallback(() => {
    setHorarioCustomizado({
      dataHora: "",
      alterado: false,
    });
  }, []);

  const obterDataHoraParaEnvio = useCallback(() => {
    return horarioCustomizado.alterado ? horarioCustomizado.dataHora : "";
  }, [horarioCustomizado]);

  return {
    horarioCustomizado,
    ajustarHorario,
    limparHorario,
    obterDataHoraParaEnvio,
  };
}
