"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Search } from "lucide-react";
import {
  useBuscaOSEvento13,
  useSalvarEvento,
  useNavigation,
} from "../components/hooks";
import { notifyError } from "../components/NotificationsProvider";
import type { OrdemServico } from "../types/os";

interface Evento13Props {
  onConsultarOS: () => void;
  osSelecionada: OrdemServico | null;
  dataHoraCustomizada?: string;
}

type Evento13Form = {
  num_os: string;
  quantidade: string;
};

export default function Evento13({
  osSelecionada,
  dataHoraCustomizada,
}: Evento13Props) {
  const [data, setData] = useState<Evento13Form>({
    num_os: osSelecionada?.numero ?? "",
    quantidade: "",
  });

  const [quantidadeHabilitada, setQuantidadeHabilitada] = useState(false);

  const {
    osInfo,
    referencia,
    erroBuscaOS,
    buscandoOS,
    consultarOS,
    setReferencia,
  } = useBuscaOSEvento13();

  const { salvando, salvarEvento } = useSalvarEvento();
  const { cancelarERedirecionarParaHome } = useNavigation();

  const titulo = "Divisão de OS";

  const limparCampos = () => {
    setQuantidadeHabilitada(false);
    setData((prev) => ({ ...prev, quantidade: "" }));
  };

  const handleConsultarOS = useCallback(async () => {
    const numeroOS = data.num_os.trim();

    if (!numeroOS) {
      notifyError("Informe o número da OS");
      return;
    }

    limparCampos();
    const resultado = await consultarOS(numeroOS);

    if (resultado) {
      setQuantidadeHabilitada(true);
    } else {
      // Se não encontrou ou saldo zerado, limpar o campo OS
      setData((prev) => ({ ...prev, num_os: "" }));
    }
  }, [data.num_os, consultarOS]);

  // Inicializar referência se OS foi pré-selecionada
  useEffect(() => {
    if (osSelecionada && !referencia) {
      setReferencia(`OS ${osSelecionada.numero}`);
      // Usar setTimeout para evitar chamadas síncronas no effect
      setTimeout(() => {
        handleConsultarOS();
      }, 0);
    }
  }, [osSelecionada, referencia, setReferencia, handleConsultarOS]);

  const handleQuantidadeChange = (value: string) => {
    if (!osInfo) return;

    const quantidade = parseFloat(value);

    if (
      value === "" ||
      (!isNaN(quantidade) &&
        quantidade > 0 &&
        quantidade <= osInfo.saldo_divisoes)
    ) {
      setData((prev) => ({ ...prev, quantidade: value }));
    }
  };

  const handleSalvar = async () => {
    const erros: string[] = [];

    if (!data.num_os.trim()) {
      erros.push("O número da OS é obrigatório.");
    } else if (!osInfo) {
      erros.push("É necessário pesquisar e encontrar dados válidos para a OS.");
    }

    if (!data.quantidade.trim()) {
      erros.push("A quantidade é obrigatória.");
    } else {
      const quantidade = parseFloat(data.quantidade);
      if (isNaN(quantidade) || quantidade <= 0) {
        erros.push("A quantidade deve ser um número maior que zero.");
      } else if (osInfo && quantidade > osInfo.saldo_divisoes) {
        erros.push(
          `A quantidade não pode ser maior que o saldo disponível (${osInfo.saldo_divisoes}).`
        );
      }
    }

    if (erros.length > 0) {
      notifyError("Erro(s) de validação:\n" + erros.join("\n"), {
        style: { whiteSpace: "pre-line" },
      });
      return;
    }

    const payload = {
      evento: "13",
      numero_os: data.num_os,
      divisao: osInfo!.ultima_divisao.toString(),
      ...(dataHoraCustomizada && { data_hora: dataHoraCustomizada }),
    };

    await salvarEvento(payload, titulo, dataHoraCustomizada);
  };

  const handleCancelar = () => {
    setData({
      num_os: "",
      quantidade: "",
    });
    setQuantidadeHabilitada(false);
    cancelarERedirecionarParaHome();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-bold text-xl text-gray-800">{titulo}</h2>
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border">
          <span className="font-medium">Evento 13</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Seção de Busca */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Busca de Dados
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Número da OS <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="border border-gray-300 px-3 py-2 rounded-lg flex-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                    value={data.num_os}
                    onChange={(e) =>
                      setData({ ...data, num_os: e.target.value })
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleConsultarOS()}
                    placeholder="Digite somente o número da OS"
                  />
                  {buscandoOS ? (
                    <div className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConsultarOS}
                      className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center hover:bg-[#2d5c5e] disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
                      disabled={!data.num_os.trim()}
                    >
                      <Search size={18} />
                    </button>
                  )}
                </div>
                <div className="mt-2 text-sm min-h-6">
                  {erroBuscaOS && (
                    <span className="text-red-600">{erroBuscaOS}</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Quantidade <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="border border-gray-300 px-3 py-2 rounded-lg w-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                  value={data.quantidade}
                  onChange={(e) => handleQuantidadeChange(e.target.value)}
                  disabled={!quantidadeHabilitada}
                  placeholder={
                    quantidadeHabilitada
                      ? "Digite a quantidade"
                      : "Primeiro busque uma OS"
                  }
                  min="0"
                  max={osInfo?.saldo_divisoes || undefined}
                  step="0.01"
                />
                <div className="mt-2 text-sm min-h-6">
                  {osInfo && (
                    <span className="text-gray-500">
                      Máximo permitido: {osInfo.saldo_divisoes}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informações da OS */}
          {osInfo && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Informações da OS
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="block text-sm font-semibold text-gray-700">
                    Número:
                  </span>
                  <span className="text-gray-800 font-medium">
                    {osInfo.numero_os}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-semibold text-gray-700">
                    Quantidade Total:
                  </span>
                  <span className="text-gray-800 font-medium">
                    {osInfo.quantidade_os}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-semibold text-gray-700">
                    Próxima Divisão:
                  </span>
                  <span className="text-gray-800 font-medium">
                    {osInfo.ultima_divisao}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-semibold text-gray-700">
                    Saldo Disponível:
                  </span>
                  <span className="text-[#3C787A] font-medium">
                    {osInfo.saldo_divisoes}
                  </span>
                </div>
              </div>
              {referencia && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs font-semibold text-white bg-[#3C787A] px-3 py-1 rounded-full">
                    {referencia}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-row justify-end gap-3 pt-4 border-t border-gray-200 md:justify-end">
        <button
          onClick={handleCancelar}
          className="flex-1 md:flex-none px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors font-medium"
          type="button"
        >
          Cancelar
        </button>
        <button
          onClick={handleSalvar}
          className="flex-1 md:flex-none text-white px-6 py-2 rounded-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
          style={{ backgroundColor: "#3C787A" }}
          disabled={salvando}
        >
          <Save size={16} />
          {salvando ? "Salvando..." : "Salvar"}
        </button>
      </div>
    </div>
  );
}
