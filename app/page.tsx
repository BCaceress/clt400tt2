"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import Image from "next/image";
import { ChevronDown, Search } from "lucide-react";
import ConsultaOSModal from "./components/ConsultaOSModal";
import { EVENTO_COMPONENTS, type EventoProps } from "./eventos";
import type { OrdemServico } from "./types/os";

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

  const codigoEventoNumero = Number(
    codigoEvento.match(/^\d+/)?.[0] ?? Number.NaN
  );
  const EventoComponent: ComponentType<EventoProps> | undefined =
    EVENTO_COMPONENTS[codigoEventoNumero];

  function carregarEvento() {
    if (!codigoEvento.trim()) {
      alert("Informe o codigo do evento");
      setEventoValido(false);
      return;
    }

    const cod = codigoEventoNumero;
    const eventoExiste = Number.isInteger(cod) && EVENTO_COMPONENTS[cod];

    if (eventoExiste) {
      setEventoValido(true);
    } else {
      alert("Evento nao encontrado");
      setEventoValido(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-visible border border-slate-100">
        <header className="bg-[#3C787A] text-white px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-lg font-semibold leading-tight">
              COLET Sistemas - CLT400 Tratamento Térmico
            </p>
            <p className="text-sm font-semibold">Evento</p>

            {/* INPUT + DROPDOWN CUSTOMIZADO */}
            <div
              className="relative flex items-center gap-2"
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setListaAberta(false);
                }
              }}
            >
              <div className="relative flex-1">
                <input
                  className="bg-white text-slate-900 h-10 px-3 pr-10 rounded-lg min-w-[220px] sm:min-w-[320px] border border-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/70 w-full"
                  placeholder="Digite o codigo ou escolha na lista"
                  value={codigoEvento}
                  onChange={(e) => setCodigoEvento(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && carregarEvento()}
                />
                <button
                  type="button"
                  aria-label="Mostrar opcoes de evento"
                  className="absolute inset-y-0 right-2 flex items-center justify-center px-1 text-slate-500 hover:text-slate-700 cursor-pointer rounded-md"
                  onClick={() => setListaAberta((prev) => !prev)}
                  tabIndex={-1}
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <button
                onClick={carregarEvento}
                aria-label="Carregar evento"
                className="h-10 w-10 bg-white text-[#3C787A] font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-white/80 flex items-center justify-center cursor-pointer"
                type="button"
              >
                <Search className="w-5 h-5" />
                <span className="sr-only">Carregar</span>
              </button>

              {listaAberta && (
                <div className="absolute left-0 top-11 z-100 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
                  {OPCOES_EVENTO.map((opcao) => (
                    <button
                      key={opcao.valor}
                      type="button"
                      className="flex w-full items-center px-3 py-2 text-left text-sm text-slate-800 hover:bg-slate-100"
                      // evita que o blur do input feche antes do clique
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setCodigoEvento(opcao.label);
                        setListaAberta(false);
                      }}
                    >
                      {opcao.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2">
            <div className="text-right">
              <p className="text-sm uppercase tracking-wide opacity-80">
                Empresa
              </p>
              <p className="text-xl font-semibold leading-tight">
                Empresa Fulano
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-white/10 border border-white/30 rounded-lg font-semibold hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/60"
              type="button"
            >
              Consultar OS
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {eventoValido && EventoComponent ? (
            <EventoComponent
              key={`${codigoEvento}-${osSelecionada?.numero ?? "sem-os"}`}
              onConsultarOS={() => setShowModal(true)}
              osSelecionada={osSelecionada}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-2 text-center">
              <div className="mb-6">
                <Image
                  src="/images/logoColet.png"
                  alt="Logo Colet"
                  width={330}
                  height={120}
                  className="mx-auto"
                  priority
                />
              </div>
              <h3 className="text-xl font-semibold text-slate-700 mb-2">
                Selecione um Evento
              </h3>
              <p className="text-slate-500">
                Digite o código do evento no campo acima ou escolha uma opção da
                lista.
              </p>
            </div>
          )}
        </div>

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
