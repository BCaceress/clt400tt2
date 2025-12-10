"use client";

import { useState } from "react";
import { Save, Search, AlertCircle, Trash2 } from "lucide-react";
import {
  useBuscaOS,
  useBuscaOperador,
  useBuscaCarga,
  useSalvarEvento,
  useNavigation,
} from "../components/hooks";
import { notifyError } from "../components/NotificationsProvider";
import SelectDropdown from "../components/SelectDropdown";
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

type PostoPossivel = {
  codigo: string;
  descricao: string;
};

type ApiResult = {
  linhas: LinhaResultado[];
  referencia: string | null;
  posto?: string;
  descricaoPosto?: string;
  postosPossiveis?: PostoPossivel[];
  numeroCarga?: number;
  cargasPrioritarias?: string;
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

  // Estado para informações de posto vindas da API
  const [postoApi, setPostoApi] = useState<string | null>(null);
  const [descricaoPostoApi, setDescricaoPostoApi] = useState<string | null>(
    null
  );
  const [postosPossiveis, setPostosPossiveis] = useState<PostoPossivel[]>([]);

  // Estado para modal de cargas prioritárias
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const [priorityCargas, setPriorityCargas] = useState<string>("");
  const [pendingResult, setPendingResult] = useState<ApiResult | null>(null);

  // Estados para edição da tabela
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null);
  const [tempQuantidade, setTempQuantidade] = useState<string>("");

  // Estados para controlar se as buscas foram realizadas
  const [cargaEncontrada, setCargaEncontrada] = useState(false);
  const [osEncontrada, setOsEncontrada] = useState(false);

  // Hooks customizados
  const { consultarOSCompleta } = useBuscaOS();
  const {
    nomeOperador,
    erroOperador,
    buscandoOperador,
    consultarOperador,
    limparOperador,
  } = useBuscaOperador();
  const { consultarCarga, buscandoCarga } = useBuscaCarga();
  const { salvando, salvarEvento } = useSalvarEvento();
  const { cancelarERedirecionarParaHome } = useNavigation();

  const titulo = tipoEvento === 10 ? "Início de Carga" : "Término de Carga";

  const limparResultado = () => {
    setLinhas([]);
    setReferencia(null);
    setErroBusca(null);
    setPostoApi(null);
    setDescricaoPostoApi(null);
    setPostosPossiveis([]);
    setCargaEncontrada(false);
    setOsEncontrada(false);
  };

  const handleConsultarCarga = async () => {
    setBuscando(true);
    setErroBusca(null);

    // Limpar outros campos antes da nova pesquisa
    setData((prev) => ({ ...prev, num_os: "", operador: "", posto_trab: "" }));
    limparOperador();
    limparResultado();

    try {
      const resultado = await consultarCarga(data.num_carga);

      // Verificar se há cargas prioritárias
      if (resultado.cargasPrioritarias && resultado.cargasPrioritarias.trim()) {
        setPriorityCargas(resultado.cargasPrioritarias);
        setPendingResult(resultado);
        setShowPriorityModal(true);
        setBuscando(false);
        return;
      }

      // Processar resultado normalmente se não há cargas prioritárias
      processarResultadoBusca(resultado);
      setCargaEncontrada(resultado.linhas.length > 0);

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

    // Limpar outros campos antes da nova pesquisa
    setData((prev) => ({
      ...prev,
      num_carga: "",
      operador: "",
      posto_trab: "",
    }));
    limparOperador();
    limparResultado();

    try {
      const resultado = await consultarOSCompleta(data.num_os, tipoEvento);
      setLinhas(resultado.linhas);
      setReferencia(resultado.referencia);

      // Processar número da carga se retornado pela API
      if (resultado.numeroCarga) {
        setData((prev) => ({
          ...prev,
          num_carga: resultado.numeroCarga!.toString(),
        }));
      }

      // Processar informações de posto vindas da API
      if (resultado.posto && resultado.descricaoPosto) {
        setPostoApi(resultado.posto);
        setDescricaoPostoApi(resultado.descricaoPosto);
        setData((prev) => ({ ...prev, posto_trab: resultado.posto! }));
        setPostosPossiveis([]);
      } else if (
        resultado.postosPossiveis &&
        resultado.postosPossiveis.length > 0
      ) {
        setPostosPossiveis(resultado.postosPossiveis);
        setPostoApi(null);
        setDescricaoPostoApi(null);
      } else {
        setPostoApi(null);
        setDescricaoPostoApi(null);
        setPostosPossiveis([]);
      }

      setOsEncontrada(resultado.linhas.length > 0);

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

  const handleLimparOperador = () => {
    limparOperador();
    setData({ ...data, operador: "" });
  };

  const handleLimparTudo = () => {
    setData({
      num_carga: "",
      num_os: "",
      operador: "",
      posto_trab: "",
    });
    limparOperador();
    limparResultado();
    setCargaEncontrada(false);
    setOsEncontrada(false);
  };

  const processarResultadoBusca = (resultado: ApiResult) => {
    setLinhas(resultado.linhas);
    setReferencia(resultado.referencia);
    setCargaEncontrada(resultado.linhas.length > 0);

    // Processar informações de posto vindas da API
    if (resultado.posto && resultado.descricaoPosto) {
      setPostoApi(resultado.posto);
      setDescricaoPostoApi(resultado.descricaoPosto);
      setData((prev) => ({ ...prev, posto_trab: resultado.posto! }));
      setPostosPossiveis([]);
    } else if (
      resultado.postosPossiveis &&
      resultado.postosPossiveis.length > 0
    ) {
      setPostosPossiveis(resultado.postosPossiveis);
      setPostoApi(null);
      setDescricaoPostoApi(null);
    } else {
      setPostoApi(null);
      setDescricaoPostoApi(null);
      setPostosPossiveis([]);
    }
  };

  const processarResultadoOS = (resultado: ApiResult) => {
    setLinhas(resultado.linhas);
    setReferencia(resultado.referencia);
    setOsEncontrada(resultado.linhas.length > 0);

    // Processar número da carga se retornado pela API
    if (resultado.numeroCarga) {
      setData((prev) => ({
        ...prev,
        num_carga: resultado.numeroCarga!.toString(),
      }));
    }

    // Processar informações de posto vindas da API
    if (resultado.posto && resultado.descricaoPosto) {
      setPostoApi(resultado.posto);
      setDescricaoPostoApi(resultado.descricaoPosto);
      setData((prev) => ({ ...prev, posto_trab: resultado.posto! }));
      setPostosPossiveis([]);
    } else if (
      resultado.postosPossiveis &&
      resultado.postosPossiveis.length > 0
    ) {
      setPostosPossiveis(resultado.postosPossiveis);
      setPostoApi(null);
      setDescricaoPostoApi(null);
    } else {
      setPostoApi(null);
      setDescricaoPostoApi(null);
      setPostosPossiveis([]);
    }
  };

  const handlePriorityConfirm = () => {
    if (pendingResult) {
      if (pendingResult.numeroCarga) {
        // É resultado de busca por OS
        processarResultadoOS(pendingResult);
      } else {
        // É resultado de busca por carga
        processarResultadoBusca(pendingResult);
      }
    }
    setShowPriorityModal(false);
    setPendingResult(null);
    setPriorityCargas("");
    setBuscando(false);
  };

  const handlePriorityCancel = () => {
    // Limpar campos e posicionar no campo de carga
    handleLimparTudo();
    setShowPriorityModal(false);
    setPendingResult(null);
    setPriorityCargas("");
    setBuscando(false);

    // Focar no campo de carga após fechar o modal
    setTimeout(() => {
      const cargaInput = document.querySelector(
        'input[placeholder="Digite o número da carga"]'
      ) as HTMLInputElement;
      if (cargaInput) {
        cargaInput.focus();
      }
    }, 100);
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
    } else {
      // Validar posto: deve ter descrição da API ou ter sido selecionado da lista
      const temDescricaoApi = !!descricaoPostoApi;
      const postoSelecionadoDaLista = postosPossiveis.some(
        (p) => p.codigo === data.posto_trab.trim()
      );

      // Se não tem descrição da API e não foi selecionado da lista, é um posto digitado manualmente (aceito)
      if (
        !temDescricaoApi &&
        !postoSelecionadoDaLista &&
        postosPossiveis.length > 0
      ) {
        erros.push(
          "É necessário selecionar um dos postos de trabalho disponíveis."
        );
      }
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

  const handleEditarQuantidade = (index: number) => {
    setEditingRowIndex(index);
    setTempQuantidade(linhas[index].quantidade.toString());
  };

  const handleSalvarEdicao = (index: number) => {
    const novaQuantidade = parseInt(tempQuantidade);
    if (!isNaN(novaQuantidade) && novaQuantidade > 0) {
      const novasLinhas = [...linhas];
      novasLinhas[index] = {
        ...novasLinhas[index],
        quantidade: novaQuantidade,
      };
      setLinhas(novasLinhas);
    }
    setEditingRowIndex(null);
    setTempQuantidade("");
  };

  const handleCancelarEdicao = () => {
    setEditingRowIndex(null);
    setTempQuantidade("");
  };

  const handleCancelar = () => {
    handleLimparTudo();
    setEditingRowIndex(null);
    setTempQuantidade("");
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
                    type="number"
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
                  {buscandoCarga ? (
                    <div className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : cargaEncontrada ? (
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
                      onClick={handleConsultarCarga}
                      className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center hover:bg-[#2d5c5e] disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
                      disabled={
                        data.num_os.trim().length > 0 || !data.num_carga.trim()
                      }
                    >
                      <Search size={18} />
                    </button>
                  )}
                </div>
              </div>

              <div
                className={`${
                  data.num_carga.trim().length > 0 ? "hidden md:block" : ""
                }`}
              >
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Número da OS
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="border border-gray-300 px-3 py-2 rounded-lg flex-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                    value={data.num_os}
                    onChange={(e) =>
                      setData({ ...data, num_os: e.target.value })
                    }
                    onKeyDown={(e) => e.key === "Enter" && handleConsultarOS()}
                    disabled={data.num_carga.trim().length > 0}
                    placeholder="Digite o número da OS (0000.00)"
                  />
                  {buscando ? (
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
                      disabled={
                        data.num_carga.trim().length > 0 || !data.num_os.trim()
                      }
                    >
                      <Search size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Seção de Dados Operacionais */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Dados Operacionais
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Posto de Trabalho <span className="text-red-500">*</span>
                </label>

                {/* Dropdown quando há postos possíveis da API */}
                {postosPossiveis.length > 0 ? (
                  <SelectDropdown
                    options={postosPossiveis}
                    value={data.posto_trab}
                    onChange={(value) => {
                      const selectedPosto = postosPossiveis.find(
                        (p) => p.codigo === value
                      );
                      setData({ ...data, posto_trab: value });
                      if (selectedPosto) {
                        setDescricaoPostoApi(selectedPosto.descricao);
                      }
                    }}
                    placeholder="Selecione um posto"
                  />
                ) : (
                  /* Input normal sem busca */
                  <input
                    className="border border-gray-300 px-3 py-2 rounded-lg w-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                    value={
                      postoApi && descricaoPostoApi
                        ? `${postoApi} (${descricaoPostoApi})`
                        : data.posto_trab
                    }
                    onChange={(e) =>
                      setData({ ...data, posto_trab: e.target.value })
                    }
                    placeholder={
                      postoApi ? "Posto definido pela API" : "Código do posto"
                    }
                    disabled={!!postoApi}
                  />
                )}

                <div className="mt-2 text-sm min-h-6"></div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Operador <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    className="border border-gray-300 px-3 py-2 rounded-lg flex-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                    value={
                      nomeOperador
                        ? `${data.operador} (${nomeOperador})`
                        : data.operador
                    }
                    onChange={(e) =>
                      setData({ ...data, operador: e.target.value })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      !nomeOperador &&
                      handleConsultarOperador()
                    }
                    placeholder="Código do operador"
                    disabled={!!nomeOperador}
                  />
                  {buscandoOperador ? (
                    <div className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : nomeOperador ? (
                    <button
                      type="button"
                      onClick={handleLimparOperador}
                      className="h-10 w-12 rounded-lg bg-orange-400 text-white flex items-center justify-center hover:bg-orange-500 cursor-pointer transition-colors shadow-sm"
                      title="Limpar operador"
                    >
                      <Trash2 size={16} />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConsultarOperador}
                      className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center hover:bg-[#2d5c5e] cursor-pointer transition-colors shadow-sm"
                      disabled={!data.operador.trim()}
                    >
                      <Search size={18} />
                    </button>
                  )}
                </div>
                <div className="mt-2 text-sm min-h-6">
                  {erroOperador && !buscandoOperador && (
                    <span className="text-red-600">{erroOperador}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Seção de Resultados */}
        <div className="xl:col-span-1">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm h-full">
            <div className="mb-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-800">
                    Resultados
                  </h3>
                  <p className="text-xs text-gray-600 mt-1">
                    Pesquise por carga ou OS para visualizar os dados
                  </p>
                </div>
                {referencia && (
                  <span className="text-xs font-semibold text-white bg-[#3C787A] px-3 py-1 rounded-full whitespace-nowrap inline-block">
                    <span className="lg:hidden">
                      {referencia.replace(/^(CARGA|Carga|carga)\s*/i, "")}
                    </span>
                    <span className="hidden lg:inline">{referencia}</span>
                  </span>
                )}
              </div>
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
                          {editingRowIndex === index ? (
                            <input
                              type="number"
                              value={tempQuantidade}
                              onChange={(e) =>
                                setTempQuantidade(e.target.value)
                              }
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  handleSalvarEdicao(index);
                                } else if (e.key === "Escape") {
                                  handleCancelarEdicao();
                                }
                              }}
                              onBlur={() => handleSalvarEdicao(index)}
                              className="w-full text-right border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent bg-white"
                              autoFocus
                              min="1"
                            />
                          ) : (
                            <span
                              onClick={() => handleEditarQuantidade(index)}
                              className="cursor-pointer hover:bg-blue-50 hover:text-blue-700 px-2 py-1 rounded transition-colors inline-block w-full"
                              title="Clique para editar"
                            >
                              {linha.quantidade.toLocaleString()}
                            </span>
                          )}
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

      {/* Modal de Cargas Prioritárias */}
      {showPriorityModal && (
        <div className="fixed top-0 left-0 w-screen h-screen bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-lg animate-in fade-in duration-200">
            {/* Cabeçalho */}
            <div className="bg-[#3C787A] text-white px-6 py-4 rounded-t-xl">
              <h3 className="text-lg font-semibold flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-yellow-400 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-900" />
                </div>
                Atenção
              </h3>
            </div>

            {/* Conteúdo */}
            <div className="p-6">
              <p className="text-gray-700 leading-relaxed mb-2">
                As seguintes cargas são prioritárias e deveriam ser produzidas
                antes desta:
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <span className="font-semibold text-red-700">
                  {priorityCargas}
                </span>
              </div>
              <p className="text-gray-700 font-medium">
                Deseja prosseguir mesmo assim?
              </p>
            </div>

            {/* Botões */}
            <div className="flex gap-3 px-6 pb-6 sm:justify-end">
              <button
                onClick={handlePriorityCancel}
                className="flex-1 sm:flex-none px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-all duration-150 font-medium"
              >
                Não
              </button>
              <button
                onClick={handlePriorityConfirm}
                className="flex-1 sm:flex-none px-5 py-2.5 bg-[#3C787A] text-white rounded-lg hover:bg-[#2d5c5e] active:bg-[#245456] transition-all duration-150 font-medium shadow-sm"
              >
                Sim, prosseguir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
