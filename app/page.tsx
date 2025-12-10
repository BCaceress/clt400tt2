"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import Image from "next/image";
import { ChevronDown, Search, FileSearch } from "lucide-react";
import ConsultaOSModal from "./components/ConsultaOSModal";
import { notifyError, notifyInfo } from "./components/NotificationsProvider";
import { EVENTO_COMPONENTS, type EventoProps } from "./eventos";
import type { OrdemServico } from "./types/os";
import { useParametros } from "./components/hooks";

const OPCOES_EVENTO = [
  { valor: "10", label: "10 - Início de Produção" },
  { valor: "15", label: "15 - Fim de Produção" },
  { valor: "13", label: "13 - Divisão de OS" },
  { valor: "19", label: "19 - Resultado de Etapa" },
  { valor: "80", label: "80 - Resultado de Inspeção" },
  { valor: "85", label: "85 - Resultado de Inspeção de Carga" },
  { valor: "50", label: "50 - Situação de Postos" },
  { valor: "51", label: "51 - Situação de Postos" },
  { valor: "52", label: "52 - Situação de Postos" },
  { valor: "53", label: "53 - Situação de Postos" },
  { valor: "54", label: "54 - Situação de Postos" },
  { valor: "59", label: "59 - Patamares de Postos de Trabalho" },
  { valor: "32", label: "32 - Entrada de Operador" },
  { valor: "38", label: "38 - Saída de Operador" },
  { valor: "25", label: "25 - Confirmação de Embarque" },
  { valor: "27", label: "27 - Confirmação de Embarque sem NF" },
  { valor: "99", label: "99 - Eventos de Manutenção" },
  { valor: "40", label: "40 - Início de Processo" },
  { valor: "41", label: "41 - Término de Processo" },
  { valor: "44", label: "44 - Processo Executado" },
];

export default function Page() {
  const [codigoEvento, setCodigoEvento] = useState("");
  const [eventoValido, setEventoValido] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [osSelecionada, setOsSelecionada] = useState<OrdemServico | null>(null);

  const [listaAberta, setListaAberta] = useState(false);

  // Hook para gerenciar parâmetros da empresa
  const { parametros, loading: loadingParametros } = useParametros();

  const codigoEventoNumero = Number(
    codigoEvento.match(/^\d+/)?.[0] ?? Number.NaN
  );
  const EventoComponent: ComponentType<EventoProps> | undefined =
    EVENTO_COMPONENTS[codigoEventoNumero];

  function carregarEvento() {
    if (!codigoEvento.trim()) {
      notifyInfo("Informe o código do evento");
      setEventoValido(false);
      return;
    }

    const cod = codigoEventoNumero;
    const eventoExiste = Number.isInteger(cod) && EVENTO_COMPONENTS[cod];

    if (eventoExiste) {
      setEventoValido(true);
    } else {
      notifyError("Evento não encontrado");
      setEventoValido(false);
    }
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="w-full min-h-screen flex flex-col bg-white/80 backdrop-blur-sm overflow-visible shadow-sm">
        <header className="bg-linear-to-r from-[#2D5A5C] to-[#3C787A] text-white px-4 sm:px-6 py-6 sm:py-8 shadow-lg border-b border-white/10">
          {/* Layout para Desktop (xl) */}
          <div className="hidden xl:flex xl:flex-row xl:items-start xl:justify-between gap-6 xl:gap-8">
            {/* Seção do título e formulário */}
            <div className="flex-1 space-y-4">
              <div className="space-y-2">
                <p className="text-xl sm:text-2xl font-bold leading-tight tracking-tight">
                  COLET Sistemas - CLT400 Tratamento Térmico
                </p>
                <p className="text-sm font-medium opacity-80 uppercase tracking-wider">
                  Evento
                </p>
              </div>

              {/* INPUT + DROPDOWN CUSTOMIZADO */}
              <div
                className="relative flex items-center gap-3"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setListaAberta(false);
                  }
                }}
              >
                <div className="relative flex-1 max-w-lg">
                  <input
                    className="bg-white/95 backdrop-blur text-slate-900 h-12 px-4 pr-12 rounded-xl w-full border-2 border-white/30 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-white/60 text-sm sm:text-base placeholder-slate-500 transition-all duration-200"
                    placeholder="Digite o código ou escolha na lista"
                    value={codigoEvento}
                    onChange={(e) => setCodigoEvento(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && carregarEvento()}
                  />
                  <button
                    type="button"
                    aria-label="Mostrar opcoes de evento"
                    className="absolute inset-y-0 right-3 flex items-center justify-center text-slate-500 hover:text-slate-700 cursor-pointer transition-colors duration-200"
                    onClick={() => setListaAberta((prev) => !prev)}
                    tabIndex={-1}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        listaAberta ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={carregarEvento}
                  aria-label="Carregar evento"
                  className="h-12 w-12 bg-white/20 backdrop-blur text-white font-semibold rounded-xl shadow-lg hover:bg-white/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/80 flex items-center justify-center cursor-pointer transition-all duration-200 border border-white/20"
                  type="button"
                >
                  <Search className="w-5 h-5" />
                  <span className="sr-only">Carregar</span>
                </button>

                {listaAberta && (
                  <div className="absolute left-0 top-14 z-50 mt-1 max-h-64 w-full max-w-lg overflow-auto rounded-xl border border-slate-200/50 bg-white/95 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      {OPCOES_EVENTO.map((opcao) => (
                        <button
                          key={opcao.valor}
                          type="button"
                          className="flex w-full items-center px-4 py-3 text-left text-base text-slate-800 hover:bg-slate-100/80 rounded-lg transition-all duration-150 hover:shadow-sm"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setCodigoEvento(opcao.label);
                            setListaAberta(false);
                          }}
                        >
                          <span className="font-bold text-[#3C787A] mr-3">
                            {opcao.valor}
                          </span>
                          <span>{opcao.label.split(" - ")[1]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Seção da empresa e botão consultar OS */}
            <div className="flex flex-col xl:flex-col xl:items-end gap-4 xl:gap-4">
              <div className="text-right xl:text-right space-y-1">
                <p className="text-xs uppercase tracking-wider opacity-70 font-medium">
                  Empresa
                </p>
                <p className="text-xl sm:text-2xl font-bold leading-tight">
                  {loadingParametros
                    ? "Carregando..."
                    : parametros?.nome_empresa || "Empresa não definida"}
                </p>
              </div>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-white/20 backdrop-blur border border-white/30 rounded-xl font-semibold hover:bg-white/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/60 transition-all duration-200 whitespace-nowrap shadow-lg cursor-pointer"
                type="button"
              >
                <FileSearch className="w-4 h-4 inline mr-2" />
                Consultar OS
              </button>
            </div>
          </div>

          {/* Layout para Tablet e Mobile (sm até lg) */}
          <div className="flex xl:hidden flex-col space-y-6">
            {/* CLT400 TT e Empresa */}
            <div className="flex justify-between items-center">
              <p className="text-lg md:text-xl font-bold">CLT400 TT</p>
              <p className="text-lg md:text-xl font-bold">
                {loadingParametros
                  ? "Carregando..."
                  : parametros?.nome_empresa || "Empresa não definida"}
              </p>
            </div>

            {/* Input e botões */}
            <div className="w-full max-w-2xl">
              <div
                className="relative flex items-center gap-3"
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setListaAberta(false);
                  }
                }}
              >
                <div className="relative flex-1">
                  <input
                    className="bg-white/95 backdrop-blur text-slate-900 h-12 px-4 pr-12 rounded-xl w-full border-2 border-white/30 shadow-lg focus:outline-none focus:ring-2 focus:ring-white/80 focus:border-white/60 text-sm md:text-base placeholder-slate-500 transition-all duration-200"
                    placeholder="Digite o código ou escolha na lista"
                    value={codigoEvento}
                    onChange={(e) => setCodigoEvento(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && carregarEvento()}
                  />
                  <button
                    type="button"
                    aria-label="Mostrar opcoes de evento"
                    className="absolute inset-y-0 right-3 flex items-center justify-center text-slate-500 hover:text-slate-700 cursor-pointer transition-colors duration-200"
                    onClick={() => setListaAberta((prev) => !prev)}
                    tabIndex={-1}
                  >
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        listaAberta ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={carregarEvento}
                  aria-label="Carregar evento"
                  className="h-12 w-20 bg-white/20 backdrop-blur text-white font-semibold rounded-xl shadow-lg hover:bg-white/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/80 flex items-center justify-center cursor-pointer transition-all duration-200 border border-white/20"
                  type="button"
                >
                  <Search className="w-5 h-5" />
                  <span className="sr-only">Carregar</span>
                </button>

                <button
                  onClick={() => setShowModal(true)}
                  className="h-12 w-20 bg-white/20 backdrop-blur border border-white/30 rounded-xl font-semibold hover:bg-white/30 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/60 transition-all duration-200 flex items-center justify-center shadow-lg"
                  type="button"
                >
                  <FileSearch className="w-5 h-5" />
                  <span className="sr-only">Consultar OS</span>
                </button>

                {listaAberta && (
                  <div className="absolute left-0 top-14 z-50 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-slate-200/50 bg-white/95 backdrop-blur-md shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                      {OPCOES_EVENTO.map((opcao) => (
                        <button
                          key={opcao.valor}
                          type="button"
                          className="flex w-full items-center px-4 py-3 text-left text-base text-slate-800 hover:bg-slate-100/80 rounded-lg transition-all duration-150 hover:shadow-sm"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => {
                            setCodigoEvento(opcao.label);
                            setListaAberta(false);
                          }}
                        >
                          <span className="font-bold text-[#3C787A] mr-3">
                            {opcao.valor}
                          </span>
                          <span>{opcao.label.split(" - ")[1]}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 bg-white p-6 sm:p-6 space-y-6">
          {eventoValido && EventoComponent ? (
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 p-6 sm:p-6">
              <EventoComponent
                key={`${codigoEvento}-${osSelecionada?.numero ?? "sem-os"}`}
                onConsultarOS={() => setShowModal(true)}
                osSelecionada={osSelecionada}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-full py-12 sm:py-16 text-center">
              <div className="mb-15 p-8 bg-white/60 backdrop-blur rounded-3xl shadow-lg border border-slate-200/50">
                <Image
                  src="/images/logoColet.png"
                  alt="Logo Colet"
                  width={280}
                  height={100}
                  className="mx-auto w-auto h-auto max-w-[280px] sm:max-w-[330px] drop-shadow-sm"
                  priority
                />
              </div>
              <div className="space-y-4 max-w-lg">
                <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4">
                  Selecione um Evento
                </h3>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                  Digite o código do evento no campo acima ou escolha uma opção
                  da lista para começar.
                </p>
                <div className="flex items-center justify-center gap-2 text-sm text-slate-500 mt-6">
                  <div className="w-2 h-2 bg-[#3C787A] rounded-full animate-pulse"></div>
                  <span>Aguardando seleção de evento</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé - visível apenas em desktop */}
        <footer className="hidden xl:block bg-linear-to-r from-[#2D5A5C] to-[#3C787A] text-white py-3 px-6 border-t border-white/10">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              <span className="opacity-80">© 2026 COLET Sistemas</span>
              <span className="opacity-60">|</span>
              <span className="opacity-80">CLT400 Tratamento Térmico</span>
            </div>
            <div className="opacity-70">Sistema de Gestão Industrial</div>
          </div>
        </footer>

        {showModal && (
          <ConsultaOSModal
            onClose={() => setShowModal(false)}
            onSelectOS={(os) => {
              setOsSelecionada(os);
              setShowModal(false);
            }}
          />
        )}
      </div>
    </main>
  );
}
