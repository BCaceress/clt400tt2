"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Search, Trash2 } from "lucide-react";
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
  const [osEncontrada, setOsEncontrada] = useState(false);

  const {
    osInfo,
    referencia,
    erroBuscaOS,
    buscandoOS,
    consultarOS,
    setReferencia,
    limparBuscaOS,
  } = useBuscaOSEvento13();

  const { salvando, salvarEvento } = useSalvarEvento();
  const { cancelarERedirecionarParaHome } = useNavigation();

  const titulo = "Divisão de OS";

  const limparCampos = () => {
    setQuantidadeHabilitada(false);
    setOsEncontrada(false);
    setData((prev) => ({ ...prev, quantidade: "" }));
  };

  const handleLimparTudo = () => {
    setData({
      num_os: "",
      quantidade: "",
    });
    setQuantidadeHabilitada(false);
    setOsEncontrada(false);
    limparBuscaOS();
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
      setOsEncontrada(true);
    } else {
      // Se não encontrou ou saldo zerado, limpar o campo OS
      setData((prev) => ({ ...prev, num_os: "" }));
      setOsEncontrada(false);
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
      numero_os: parseInt(data.num_os),
      divisao: osInfo?.proxima_divisao || 0,
      qtde_divisao: parseFloat(data.quantidade),
      data_hora: dataHoraCustomizada || "",
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
              <div className="md:col-span-2">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">
                    Número da OS <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      className="border border-gray-300 px-3 py-2 rounded-lg flex-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                      value={data.num_os}
                      onChange={(e) =>
                        setData({ ...data, num_os: e.target.value })
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        !osEncontrada &&
                        handleConsultarOS()
                      }
                      placeholder="Digite somente o número da OS"
                      disabled={osEncontrada}
                    />
                    {buscandoOS ? (
                      <div className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : osEncontrada ? (
                      <button
                        type="button"
                        onClick={handleLimparTudo}
                        className="h-10 w-12 rounded-lg bg-orange-400 text-white flex items-center justify-center hover:bg-orange-500 cursor-pointer transition-colors shadow-sm"
                        title="Limpar pesquisa"
                      >
                        <Trash2 size={16} />
                      </button>
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
                    onChange={(e) =>
                      setData({ ...data, quantidade: e.target.value })
                    }
                    disabled={!quantidadeHabilitada}
                    placeholder={
                      quantidadeHabilitada
                        ? "Digite a quantidade"
                        : "Primeiro busque uma OS"
                    }
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Painel do Saldo Divisão */}
              <div className="bg-white border border-gray-200 rounded-lg shadow-sm w-full h-full flex flex-col">
                {/* Título Fixo */}
                <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="text-sm font-semibold text-gray-700 text-center">
                    Saldo Divisão
                  </div>
                </div>

                {/* Conteúdo Dinâmico */}
                <div className="flex-1 flex items-center justify-center px-4 py-4">
                  {buscandoOS ? (
                    <div className="text-center">
                      <div className="w-8 h-8 border-2 border-[#3C787A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                      <div className="text-sm text-gray-500">
                        Consultando...
                      </div>
                    </div>
                  ) : osInfo ? (
                    <div className="text-center">
                      <div className="text-3xl font-bold text-[#3C787A] mb-1">
                        {osInfo.saldo_divisoes}
                      </div>
                      <div className="text-xs text-gray-500 font-medium">
                        {osInfo.saldo_divisoes === 1 ? "unidade" : "unidades"}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="w-8 h-8 mx-auto mb-3 text-gray-300">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="text-sm text-gray-400">
                        Aguardando consulta
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
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
