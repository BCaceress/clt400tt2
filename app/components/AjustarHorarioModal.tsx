import { useState, useEffect, useCallback } from "react";
import { X, Clock } from "lucide-react";

interface AjustarHorarioModalProps {
  onClose: () => void;
  onConfirm: (dataHora: string) => void;
  dataHoraAtual?: string;
}

export default function AjustarHorarioModal({
  onClose,
  onConfirm,
  dataHoraAtual,
}: AjustarHorarioModalProps) {
  // Função para calcular o valor inicial
  const calcularDataHoraInicial = useCallback(() => {
    if (dataHoraAtual) {
      // Converte para formato datetime-local
      const data = new Date(dataHoraAtual);
      const dataLocal = new Date(
        data.getTime() - data.getTimezoneOffset() * 60000
      );
      return dataLocal.toISOString().slice(0, 16);
    } else {
      // Usa a data/hora atual
      const agora = new Date();
      const agoraLocal = new Date(
        agora.getTime() - agora.getTimezoneOffset() * 60000
      );
      return agoraLocal.toISOString().slice(0, 16);
    }
  }, [dataHoraAtual]);

  const [dataHora, setDataHora] = useState(calcularDataHoraInicial);

  // Atualiza apenas quando dataHoraAtual mudar
  useEffect(() => {
    setDataHora(calcularDataHoraInicial());
  }, [calcularDataHoraInicial]);

  const handleConfirm = () => {
    if (dataHora) {
      // Converte para ISO string
      const dataISO = new Date(dataHora).toISOString();
      onConfirm(dataISO);
    }
  };

  const handleUsarAgora = () => {
    const agora = new Date();
    const agoraLocal = new Date(
      agora.getTime() - agora.getTimezoneOffset() * 60000
    );
    setDataHora(agoraLocal.toISOString().slice(0, 16));
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      style={{ minHeight: "100dvh" }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-in fade-in zoom-in duration-200"
        style={{
          position: "relative",
          transform: "translateZ(0)", // Force hardware acceleration for better mobile performance
          maxHeight: "min(90vh, 90dvh)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-[#3C787A] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 rounded-lg">
              <Clock className="w-5 h-5 text-black" />
            </div>
            <h2 className="text-xl font-bold text-white">Ajustar Horário</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer"
            type="button"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="space-y-2 ">
            <label
              htmlFor="dataHora"
              className="block text-sm font-medium text-slate-700"
            >
              Data e Hora
            </label>
            <input
              id="dataHora"
              type="datetime-local"
              value={dataHora}
              onChange={(e) => setDataHora(e.target.value)}
              className="w-full h-12 px-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#3C787A] focus:border-[#3C787A] transition-all duration-200 text-slate-900"
            />
          </div>

          <button
            onClick={handleUsarAgora}
            className="w-full px-4 py-2 text-sm bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors duration-200 border border-slate-300 cursor-pointer"
            type="button"
          >
            Usar horário atual
          </button>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-slate-200 rounded-b-2xl">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all duration-200 font-medium cursor-pointer"
            type="button"
          >
            Cancelar
          </button>

          <button
            onClick={handleConfirm}
            disabled={!dataHora}
            className="flex-1 px-6 py-3 bg-[#3C787A] text-white rounded-xl hover:bg-[#2D5A5C] disabled:opacity-50 transition-all duration-200 font-medium cursor-pointer"
            type="button"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
}
