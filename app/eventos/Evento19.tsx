"use client";

import { useState } from "react";
import { Save, Search } from "lucide-react";
import {
  useBuscaOS,
  useBuscaOperador,
  useBuscaServico,
  useBuscaInstrumento,
  useSalvarEvento,
  useNavigation,
} from "../components/hooks";
import { notifyError } from "../components/NotificationsProvider";
import type { OrdemServico } from "../types/os";

interface Evento19Props {
  onConsultarOS: () => void;
  osSelecionada: OrdemServico | null;
}

type Evento19Form = {
  num_os: string;
  servico: string;
  operador: string;
  instrumento: string;
  resultado: string;
};

export default function Evento19({ osSelecionada }: Evento19Props) {
  const [data, setData] = useState<Evento19Form>({
    num_os: osSelecionada?.numero ?? "",
    servico: "",
    operador: "",
    instrumento: "",
    resultado: "",
  });

  // Hooks customizados
  const {
    osInfo,
    referencia,
    erroBuscaOS,
    buscandoOS,
    consultarOS,
    setReferencia,
  } = useBuscaOS();

  const { descricaoServico, erroServico, buscandoServico, consultarServico } =
    useBuscaServico();

  const { nomeOperador, erroOperador, buscandoOperador, consultarOperador } =
    useBuscaOperador();

  const {
    descricaoInstrumento,
    erroInstrumento,
    buscandoInstrumento,
    consultarInstrumento,
  } = useBuscaInstrumento();

  const { salvando, salvarEvento } = useSalvarEvento();
  const { cancelarERedirecionarParaHome } = useNavigation();

  const titulo = "Resultado de Etapa";

  // Inicializar referência se OS foi pré-selecionada
  if (osSelecionada && !referencia) {
    setReferencia(`OS ${osSelecionada.numero}`);
  }

  const handleConsultarOS = async () => {
    await consultarOS(data.num_os);
  };

  const handleConsultarServico = async () => {
    await consultarServico(data.servico);
  };

  const handleConsultarOperador = async () => {
    await consultarOperador(data.operador);
  };

  const handleConsultarInstrumento = async () => {
    await consultarInstrumento(data.instrumento);
  };

  const handleSalvar = async () => {
    const erros: string[] = [];

    if (!data.num_os.trim()) {
      erros.push("O número da OS é obrigatório.");
    } else if (!osInfo) {
      erros.push("É necessário pesquisar e encontrar dados válidos para a OS.");
    }

    if (!data.servico.trim()) {
      erros.push("O código do serviço é obrigatório.");
    } else if (!descricaoServico || erroServico) {
      erros.push("É necessário pesquisar e encontrar um serviço válido.");
    }

    if (!data.operador.trim()) {
      erros.push("O código do operador é obrigatório.");
    } else if (!nomeOperador || erroOperador) {
      erros.push("É necessário pesquisar e encontrar um operador válido.");
    }

    if (!data.instrumento.trim()) {
      erros.push("O código do instrumento é obrigatório.");
    } else if (!descricaoInstrumento || erroInstrumento) {
      erros.push("É necessário pesquisar e encontrar um instrumento válido.");
    }

    if (!data.resultado.trim()) {
      erros.push("Informe o resultado do serviço.");
    }

    if (erros.length > 0) {
      notifyError("Erro(s) de validação:\\n\\n" + erros.join("\\n"), {
        style: { whiteSpace: "pre-line" },
      });
      return;
    }

    const payload = {
      numero_os: data.num_os.trim(),
      codigo_servico: data.servico.trim(),
      codigo_pessoa: data.operador.trim(),
      codigo_instrumento: data.instrumento.trim(),
      resultado: data.resultado.trim(),
      tipo_lcto: "19",
    };

    await salvarEvento(payload, titulo);
  };

  const handleCancelar = () => {
    setData({
      num_os: "",
      servico: "",
      operador: "",
      instrumento: "",
      resultado: "",
    });
    cancelarERedirecionarParaHome();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-bold text-xl text-gray-800">{titulo}</h2>
        </div>
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border">
          <span className="font-medium">Evento 19</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Busca de Dados
            </h3>

            <div className="space-y-3">
              <label className="block text-sm font-semibold text-gray-700">
                Número da OS
              </label>
              <div className="flex gap-2">
                <input
                  className="border border-gray-300 px-3 py-2 rounded-lg flex-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent transition-colors"
                  value={data.num_os}
                  onChange={(e) => setData({ ...data, num_os: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && handleConsultarOS()}
                  placeholder="Digite o numero da OS"
                />
                <button
                  type="button"
                  onClick={handleConsultarOS}
                  className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center hover:bg-[#2d5c5e] cursor-pointer transition-colors shadow-sm"
                >
                  <Search size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Dados Operacionais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Serviço <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    className="border border-gray-300 px-3 py-2 rounded-lg flex-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent transition-colors"
                    value={data.servico}
                    onChange={(e) =>
                      setData({ ...data, servico: e.target.value })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleConsultarServico()
                    }
                    placeholder="Código do servico"
                  />
                  <button
                    type="button"
                    onClick={handleConsultarServico}
                    className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center hover:bg-[#2d5c5e] cursor-pointer transition-colors shadow-sm"
                  >
                    <Search size={18} />
                  </button>
                </div>
                <div className="mt-2 text-sm min-h-6">
                  {buscandoServico ? (
                    <span className="text-blue-600 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Buscando servico...
                    </span>
                  ) : descricaoServico ? (
                    <span className="text-green-700 font-medium">
                      {descricaoServico}
                    </span>
                  ) : erroServico ? (
                    <span className="text-red-600">{erroServico}</span>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Operador <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    className="border border-gray-300 px-3 py-2 rounded-lg flex-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent transition-colors"
                    value={data.operador}
                    onChange={(e) =>
                      setData({ ...data, operador: e.target.value })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleConsultarOperador()
                    }
                    placeholder="Código do operador"
                  />
                  <button
                    type="button"
                    onClick={handleConsultarOperador}
                    className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center hover:bg-[#2d5c5e] cursor-pointer transition-colors shadow-sm"
                  >
                    <Search size={18} />
                  </button>
                </div>
                <div className="mt-2 text-sm min-h-6">
                  {buscandoOperador ? (
                    <span className="text-blue-600 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Buscando operador...
                    </span>
                  ) : nomeOperador ? (
                    <span className="text-green-700 font-medium">
                      {nomeOperador}
                    </span>
                  ) : erroOperador ? (
                    <span className="text-red-600">{erroOperador}</span>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Instrumento <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    className="border border-gray-300 px-3 py-2 rounded-lg flex-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent transition-colors"
                    value={data.instrumento}
                    onChange={(e) =>
                      setData({ ...data, instrumento: e.target.value })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleConsultarInstrumento()
                    }
                    placeholder="Código do instrumento"
                  />
                  <button
                    type="button"
                    onClick={handleConsultarInstrumento}
                    className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center hover:bg-[#2d5c5e] cursor-pointer transition-colors shadow-sm"
                  >
                    <Search size={18} />
                  </button>
                </div>
                <div className="mt-2 text-sm min-h-6">
                  {buscandoInstrumento ? (
                    <span className="text-blue-600 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Buscando instrumento...
                    </span>
                  ) : descricaoInstrumento ? (
                    <span className="text-green-700 font-medium">
                      {descricaoInstrumento}
                    </span>
                  ) : erroInstrumento ? (
                    <span className="text-red-600">{erroInstrumento}</span>
                  ) : null}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Resultado <span className="text-red-500">*</span>
                </label>
                <input
                  className="border border-gray-300 px-3 py-2 rounded-lg w-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent transition-colors"
                  value={data.resultado}
                  onChange={(e) =>
                    setData({ ...data, resultado: e.target.value })
                  }
                  placeholder="Informe o resultado"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="xl:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm h-full space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">Resumo</h3>
                <p className="text-xs text-gray-600 mt-1">
                  Acompanhe os dados buscados e o preenchimento dos campos.
                </p>
              </div>
              {referencia && (
                <span className="text-xs font-semibold text-white bg-[#3C787A] px-3 py-1 rounded-full whitespace-nowrap">
                  {referencia}
                </span>
              )}
            </div>

            {erroBuscaOS && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
                {erroBuscaOS}
              </div>
            )}

            {buscandoOS ? (
              <div className="flex items-center justify-center py-6">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-[#3C787A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-gray-700">
                    Buscando informacoes da OS...
                  </p>
                </div>
              </div>
            ) : osInfo ? (
              <div className="space-y-3">
                <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                  <p className="text-sm text-gray-600">OS selecionada</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {osInfo.numero_os ?? data.num_os}
                  </p>
                  {osInfo.cliente && (
                    <p className="text-sm text-gray-700 mt-1">
                      Cliente: {osInfo.cliente}
                    </p>
                  )}
                  {osInfo.descricao && (
                    <p className="text-sm text-gray-700 mt-1">
                      Descricao: {osInfo.descricao}
                    </p>
                  )}
                  {osInfo.status && (
                    <p className="text-sm text-gray-700 mt-1">
                      Status: {osInfo.status}
                    </p>
                  )}
                </div>

                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Servico</span>
                    <span className="text-right text-gray-800">
                      {descricaoServico ||
                        (erroServico ? "Pendente" : "Sem busca")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Operador</span>
                    <span className="text-right text-gray-800">
                      {nomeOperador ||
                        (erroOperador ? "Pendente" : "Sem busca")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Instrumento</span>
                    <span className="text-right text-gray-800">
                      {descricaoInstrumento ||
                        (erroInstrumento ? "Pendente" : "Sem busca")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Resultado</span>
                    <span className="text-right text-gray-800">
                      {data.resultado || "Não informado"}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 opacity-20">
                    <Search className="w-full h-full" />
                  </div>
                  <p className="text-sm">
                    Nenhuma OS carregada.
                    <br />
                    Busque o número para começar.
                  </p>
                </div>
              </div>
            )}
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
