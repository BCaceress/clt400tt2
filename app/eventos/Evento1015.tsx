"use client";

import { useState } from "react";
import { Save, Search } from "lucide-react";
import {
  useBuscaOS,
  useBuscaOperador,
  useBuscaPosto,
  useBuscaCarga,
  useSalvarEvento,
  useNavigation,
} from "../components/hooks";
import { notifyError } from "../components/NotificationsProvider";
import type { OrdemServico } from "../types/os";

type TipoEvento = 10 | 15;

interface Evento1015Props {
  tipoEvento: TipoEvento;
  onConsultarOS: () => void;
  osSelecionada: OrdemServico | null;
}

type EventoForm = {
  num_carga: string;
  num_os: string;
  operador: string;
  posto_trab: string;
};

type LinhaResultado = {
  numero_os?: number;
  divisao: number;
  quantidade: number;
};

export default function Evento1015({
  tipoEvento,
  osSelecionada,
}: Evento1015Props) {
  const [data, setData] = useState<EventoForm>({
    num_carga: "",
    num_os: osSelecionada?.numero ?? "",
    operador: "",
    posto_trab: "",
  });
  const [linhas, setLinhas] = useState<LinhaResultado[]>([]);
  const [referencia, setReferencia] = useState<string | null>(null);
  const [erroBusca, setErroBusca] = useState<string | null>(null);
  const [buscando, setBuscando] = useState(false);

  // Hooks customizados
  const { consultarOSCompleta } = useBuscaOS();
  const { nomeOperador, erroOperador, buscandoOperador, consultarOperador } =
    useBuscaOperador();
  const { descricaoPosto, erroPosto, buscandoPosto, consultarPosto } =
    useBuscaPosto();
  const { consultarCarga } = useBuscaCarga();
  const { salvando, salvarEvento } = useSalvarEvento();
  const { cancelarERedirecionarParaHome } = useNavigation();

  const titulo = tipoEvento === 10 ? "Início de Carga" : "Término de Carga";

  const limparResultado = () => {
    setLinhas([]);
    setReferencia(null);
    setErroBusca(null);
  };

  const handleConsultarCarga = async () => {
    setBuscando(true);
    setErroBusca(null);

    try {
      const resultado = await consultarCarga(data.num_carga);
      setLinhas(resultado.linhas);
      setReferencia(resultado.referencia);

      if (resultado.linhas.length === 0 && resultado.referencia) {
        setErroBusca("Nenhuma OS encontrada para a carga informada.");
      }
    } catch {
      limparResultado();
    } finally {
      setBuscando(false);
    }
  };

  const handleConsultarOS = async () => {
    setBuscando(true);
    setErroBusca(null);

    try {
      const resultado = await consultarOSCompleta(data.num_os);
      setLinhas(resultado.linhas);
      setReferencia(resultado.referencia);

      if (resultado.linhas.length === 0 && resultado.referencia) {
        setErroBusca("Nenhuma divisão encontrada para a OS informada.");
      }
    } catch {
      limparResultado();
    } finally {
      setBuscando(false);
    }
  };

  const handleConsultarOperador = async () => {
    await consultarOperador(data.operador);
  };

  const handleConsultarPosto = async () => {
    await consultarPosto(data.posto_trab);
  };

  const handleSalvar = async () => {
    const erros: string[] = [];

    if (tipoEvento === 10 && !data.num_carga.trim()) {
      erros.push("O número da carga é obrigatório para o evento 10.");
    }

    if (!data.num_carga.trim() && !data.num_os.trim()) {
      erros.push("É necessário informar o número da carga ou da OS.");
    }

    if (data.num_carga.trim() && linhas.length === 0) {
      erros.push(
        "É necessário pesquisar e encontrar dados válidos para a carga."
      );
    }

    if (data.num_os.trim() && linhas.length === 0) {
      erros.push("É necessário pesquisar e encontrar dados válidos para a OS.");
    }

    if (!data.posto_trab.trim()) {
      erros.push("O campo Posto de Trabalho é obrigatório.");
    } else if (!descricaoPosto || erroPosto) {
      erros.push(
        "É necessário pesquisar e encontrar um posto de trabalho válido."
      );
    }

    if (!data.operador.trim()) {
      erros.push("O campo Operador é obrigatório.");
    } else if (!nomeOperador || erroOperador) {
      erros.push("É necessário pesquisar e encontrar um operador válido.");
    }

    if (erros.length > 0) {
      notifyError("Erro(s) de validação:\\n\\n" + erros.join("\\n"), {
        style: { whiteSpace: "pre-line" },
      });
      return;
    }

    const payload = {
      numero_carga: parseInt(data.num_carga.trim()) || 0,
      numero_os: data.num_os.trim(),
      codigo_pessoa: data.operador.trim(),
      codigo_forno: data.posto_trab.trim(),
      tipo_lcto: tipoEvento.toString(),
    };

    await salvarEvento(payload, titulo);
  };

  const handleCancelar = () => {
    setData({
      num_carga: "",
      num_os: "",
      operador: "",
      posto_trab: "",
    });
    setLinhas([]);
    setReferencia(null);
    setErroBusca(null);
    cancelarERedirecionarParaHome();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-bold text-xl text-gray-800">{titulo}</h2>
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border">
          <span className="font-medium">Evento {tipoEvento}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Seção de Busca */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Busca de Dados
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Número da Carga
                </label>
                <div className="flex gap-2">
                  <input
                    className="border border-gray-300 px-3 py-2 rounded-lg flex-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                    value={data.num_carga}
                    onChange={(e) =>
                      setData({ ...data, num_carga: e.target.value })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleConsultarCarga()
                    }
                    disabled={data.num_os.trim().length > 0}
                    placeholder="Digite o número da carga"
                  />
                  <button
                    type="button"
                    onClick={handleConsultarCarga}
                    className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center hover:bg-[#2d5c5e] disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
                    disabled={data.num_os.trim().length > 0}
                  >
                    <Search size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Número da OS
                </label>
                <div className="flex gap-2">
                  <input
                    className="border border-gray-300 px-3 py-2 rounded-lg flex-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                    value={data.num_os}
                    onChange={(e) =>
                      setData({ ...data, num_os: e.target.value })
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleConsultarOS()}
                    disabled={data.num_carga.trim().length > 0}
                    placeholder="Digite o número da OS"
                  />
                  <button
                    type="button"
                    onClick={handleConsultarOS}
                    className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center hover:bg-[#2d5c5e] disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
                    disabled={data.num_carga.trim().length > 0}
                  >
                    <Search size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Dados Operacionais */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Dados Operacionais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Posto de Trabalho <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    className="border border-gray-300 px-3 py-2 rounded-lg flex-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent transition-colors"
                    value={data.posto_trab}
                    onChange={(e) =>
                      setData({ ...data, posto_trab: e.target.value })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleConsultarPosto()
                    }
                    placeholder="Código do posto"
                  />
                  <button
                    type="button"
                    onClick={handleConsultarPosto}
                    className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center hover:bg-[#2d5c5e] cursor-pointer transition-colors shadow-sm"
                  >
                    <Search size={18} />
                  </button>
                </div>
                <div className="mt-2 text-sm min-h-6">
                  {buscandoPosto ? (
                    <span className="text-blue-600 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Buscando posto...
                    </span>
                  ) : descricaoPosto ? (
                    <span className="text-green-700 font-medium">
                      {descricaoPosto}
                    </span>
                  ) : erroPosto ? (
                    <span className="text-red-600">{erroPosto}</span>
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
            </div>
          </div>
        </div>

        {/* Seção de Resultados */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm h-full">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Resultados
                </h3>
                <p className="text-xs text-gray-600 mt-1">
                  Pesquise por carga ou OS para visualizar os dados
                </p>
              </div>
              {referencia && (
                <span className="text-xs font-semibold text-white bg-[#3C787A] px-3 py-1 rounded-full whitespace-nowrap">
                  {referencia}
                </span>
              )}
            </div>

            {erroBusca && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
                {erroBusca}
              </div>
            )}

            {buscando ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-[#3C787A] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-sm text-gray-700">
                    Buscando informações...
                  </p>
                </div>
              </div>
            ) : linhas.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-800 border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider border-b border-r border-gray-200">
                        OS
                      </th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider border-b border-r border-gray-200">
                        Divisão
                      </th>
                      <th className="px-4 py-3 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 text-right">
                        Quantidade
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {linhas.map((linha, index) => (
                      <tr
                        key={`${linha.numero_os ?? "os"}-${linha.divisao}`}
                        className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                      >
                        <td className="px-4 py-3 border-b border-r border-gray-200">
                          {linha.numero_os ??
                            (data.num_os ||
                              (referencia?.startsWith("OS ")
                                ? referencia.replace("OS ", "")
                                : ""))}
                        </td>
                        <td className="px-4 py-3 border-b border-r border-gray-200">
                          {linha.divisao}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200 text-right font-medium">
                          {linha.quantidade.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 mx-auto mb-4 opacity-20">
                    <Search className="w-full h-full" />
                  </div>
                  <p className="text-sm">
                    Nenhum resultado para exibir.
                    <br />
                    Pesquise por carga ou OS.
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
