"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Search } from "lucide-react";
import {
  useBuscaServicosInspecao,
  useBuscaOperador,
  useSalvarEvento,
  useNavigation,
} from "../components/hooks";
import { notifyError } from "../components/NotificationsProvider";
import SelectDropdown from "../components/SelectDropdown";
import type { OrdemServico } from "../types/os";

interface Evento18Props {
  onConsultarOS: () => void;
  osSelecionada: OrdemServico | null;
  dataHoraCustomizada?: string;
}

type Evento18Form = {
  num_os: string;
  servico: string;
  operador: string;
};

export default function Evento18({
  osSelecionada,
  dataHoraCustomizada,
}: Evento18Props) {
  const [data, setData] = useState<Evento18Form>({
    num_os: osSelecionada?.numero ?? "",
    servico: "",
    operador: "",
  });

  const [servicoHabilitado, setServicoHabilitado] = useState(false);
  const [operadorHabilitado, setOperadorHabilitado] = useState(false);

  const {
    servicosInfo,
    servicoSelecionado,
    referencia: referenciaServicos,
    buscandoServicos,
    consultarServicos,
    selecionarServico,
    setReferencia: setReferenciaServicos,
  } = useBuscaServicosInspecao();

  const {
    nomeOperador,
    erroOperador,
    buscandoOperador,
    consultarOperador,
    limparOperador,
  } = useBuscaOperador();

  const { salvando, salvarEvento } = useSalvarEvento();
  const { cancelarERedirecionarParaHome } = useNavigation();

  const titulo = "Início de Inspeção";

  const handleConsultarOS = useCallback(async () => {
    const numeroOS = data.num_os.trim();

    if (!numeroOS) {
      notifyError("Informe o número da OS");
      return;
    }

    // Limpar campos
    setServicoHabilitado(false);
    setOperadorHabilitado(false);
    setData((prev) => ({
      ...prev,
      servico: "",
      operador: "",
    }));
    selecionarServico(null);
    limparOperador();

    const resultado = await consultarServicos(numeroOS);

    if (resultado) {
      setServicoHabilitado(true);
    } else {
      // Se não encontrou serviços, limpar o campo OS
      setData((prev) => ({ ...prev, num_os: "" }));
    }
  }, [data.num_os, consultarServicos, selecionarServico, limparOperador]);

  // Inicializar referência se OS foi pré-selecionada
  useEffect(() => {
    if (osSelecionada && !referenciaServicos) {
      setReferenciaServicos(`OS ${osSelecionada.numero}`);
      // Usar setTimeout para evitar chamadas síncronas no effect
      setTimeout(() => {
        handleConsultarOS();
      }, 0);
    }
  }, [
    osSelecionada,
    referenciaServicos,
    setReferenciaServicos,
    handleConsultarOS,
  ]);

  const handleServicoChange = (value: string) => {
    if (!servicosInfo) return;

    const servicoEncontrado = servicosInfo.find(
      (servico) =>
        `${servico.sequencial_servico} - ${servico.descricao_servico}` === value
    );

    if (servicoEncontrado) {
      selecionarServico(servicoEncontrado);
      setOperadorHabilitado(true);
    } else {
      selecionarServico(null);
      setOperadorHabilitado(false);
      setData((prev) => ({ ...prev, operador: "" }));
    }

    setData((prev) => ({ ...prev, servico: value }));
  };

  const handleConsultarOperador = useCallback(async () => {
    const codigoOperador = data.operador.trim();

    if (!codigoOperador) {
      notifyError("Informe o código do operador");
      return;
    }

    await consultarOperador(codigoOperador);
  }, [data.operador, consultarOperador]);

  const handleSalvar = async () => {
    const erros: string[] = [];

    if (!data.num_os.trim()) {
      erros.push("O número da OS é obrigatório.");
    } else if (!servicosInfo || servicosInfo.length === 0) {
      erros.push(
        "É necessário pesquisar e encontrar serviços válidos para a OS."
      );
    }

    if (!data.servico.trim()) {
      erros.push("O serviço é obrigatório.");
    } else if (!servicoSelecionado) {
      erros.push("É necessário selecionar um serviço válido da lista.");
    }

    if (!data.operador.trim()) {
      erros.push("O operador é obrigatório.");
    } else if (!nomeOperador) {
      erros.push(
        "É necessário pesquisar e encontrar dados válidos para o operador."
      );
    }

    if (erros.length > 0) {
      notifyError("Erro(s) de validação:\n" + erros.join("\n"), {
        style: { whiteSpace: "pre-line" },
      });
      return;
    }

    const payload = {
      evento: "18",
      numero_os: data.num_os,
      sequencial_servico: servicoSelecionado!.sequencial_servico.toString(),
      codigo_operador: data.operador,
      ...(dataHoraCustomizada && { data_hora: dataHoraCustomizada }),
    };

    await salvarEvento(payload, titulo, dataHoraCustomizada);
  };

  const handleCancelar = () => {
    setData({
      num_os: "",
      servico: "",
      operador: "",
    });
    setServicoHabilitado(false);
    setOperadorHabilitado(false);
    selecionarServico(null);
    limparOperador();
    cancelarERedirecionarParaHome();
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-bold text-xl text-gray-800">{titulo}</h2>
        <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border">
          <span className="font-medium">Evento 18</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Seção de Busca */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Busca de Dados
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Campo Número da OS */}
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
                    placeholder="Digite o número da OS e divisão (0000.00)"
                  />
                  {buscandoServicos ? (
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
              </div>

              {/* Campo Serviço */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Serviço <span className="text-red-500">*</span>
                </label>
                <SelectDropdown
                  options={
                    servicosInfo?.map((servico) => ({
                      codigo: `${servico.sequencial_servico} - ${servico.descricao_servico}`,
                      descricao: servico.descricao_servico,
                    })) || []
                  }
                  value={data.servico}
                  onChange={handleServicoChange}
                  placeholder={
                    servicoHabilitado
                      ? "Selecione um serviço"
                      : "Primeiro busque uma OS"
                  }
                  disabled={!servicoHabilitado}
                />
              </div>

              {/* Campo Operador */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Operador <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="border border-gray-300 px-3 py-2 rounded-lg flex-1 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#3C787A] focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500 transition-colors"
                    value={data.operador}
                    onChange={(e) =>
                      setData({ ...data, operador: e.target.value })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleConsultarOperador()
                    }
                    disabled={!operadorHabilitado}
                    placeholder={
                      operadorHabilitado
                        ? "Digite o código do operador"
                        : "Primeiro selecione um serviço"
                    }
                  />
                  {buscandoOperador ? (
                    <div className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={handleConsultarOperador}
                      className="h-10 w-12 rounded-lg bg-[#3C787A] text-white flex items-center justify-center hover:bg-[#2d5c5e] disabled:opacity-50 cursor-pointer transition-colors shadow-sm"
                      disabled={!operadorHabilitado || !data.operador.trim()}
                    >
                      <Search size={18} />
                    </button>
                  )}
                </div>
                <div className="mt-2 text-sm min-h-6">
                  {erroOperador && (
                    <span className="text-red-600">{erroOperador}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Informações dos Serviços */}
          {servicosInfo && servicosInfo.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Serviços Disponíveis
              </h3>
              <div className="space-y-3">
                {servicosInfo.map((servico) => (
                  <div
                    key={servico.sequencial_servico}
                    className={`p-3 rounded-lg border ${
                      servicoSelecionado?.sequencial_servico ===
                      servico.sequencial_servico
                        ? "border-[#3C787A] bg-[#3C787A]/5"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <span className="block text-sm font-semibold text-gray-700">
                          Sequencial:
                        </span>
                        <span className="text-gray-800 font-medium">
                          {servico.sequencial_servico}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-gray-700">
                          Tipo:
                        </span>
                        <span className="text-gray-800 font-medium">
                          {servico.tipo_servico}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-gray-700">
                          Descrição:
                        </span>
                        <span className="text-gray-800 font-medium">
                          {servico.descricao_servico}
                        </span>
                      </div>
                      <div>
                        <span className="block text-sm font-semibold text-gray-700">
                          Unidade:
                        </span>
                        <span className="text-gray-800 font-medium">
                          {servico.unidade_medida}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {referenciaServicos && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <span className="text-xs font-semibold text-white bg-[#3C787A] px-3 py-1 rounded-full">
                    {referenciaServicos}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Informações do Operador */}
          {nomeOperador && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Informações do Operador
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="block text-sm font-semibold text-gray-700">
                    Código:
                  </span>
                  <span className="text-gray-800 font-medium">
                    {data.operador}
                  </span>
                </div>
                <div>
                  <span className="block text-sm font-semibold text-gray-700">
                    Nome:
                  </span>
                  <span className="text-gray-800 font-medium">
                    {nomeOperador}
                  </span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <span className="text-xs font-semibold text-white bg-[#3C787A] px-3 py-1 rounded-full">
                  Operador {data.operador} - {nomeOperador}
                </span>
              </div>
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
