"use client";

import { useState } from "react";
import type { ComponentType } from "react";
import { Search } from "lucide-react";
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

  const abrirListaEvento = (
    input: HTMLInputElement & { showPicker?: () => void }
  ) => {
    try {
      input.showPicker?.();
    } catch {
      // showPicker exige gesto do usuário em alguns navegadores; ignorar falha.
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
        <header className="bg-[#3C787A] text-white px-6 py-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-lg font-semibold leading-tight">
              CLT400 Tratamento Térmico
            </p>
            <p className="text-sm font-semibold">Evento</p>
            <div className="flex items-center gap-2">
              <input
                className="bg-white text-slate-900 h-10 px-3 rounded-lg min-w-[150px] border border-white/50 shadow-sm focus:outline-none focus:ring-2 focus:ring-white/70"
                list="eventos-lista"
                placeholder="Digite ou escolha"
                value={codigoEvento}
                onChange={(e) => setCodigoEvento(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && carregarEvento()}
                onClick={(e) => abrirListaEvento(e.currentTarget)}
              />
              <button
                onClick={carregarEvento}
                aria-label="Carregar evento"
                className="h-10 w-10 bg-white text-[#3C787A] font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-white/80 flex items-center justify-center"
              >
                <Search className="w-5 h-5" />
                <span className="sr-only">Carregar</span>
              </button>
            </div>
            <datalist id="eventos-lista">
              {OPCOES_EVENTO.map((opcao) => (
                <option key={opcao.valor} value={opcao.label} />
              ))}
            </datalist>
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
            >
              Consultar OS
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6">
          {/* Carrega componente dinamico */}
          {eventoValido && EventoComponent && (
            <EventoComponent
              key={`${codigoEvento}-${osSelecionada?.numero ?? "sem-os"}`}
              onConsultarOS={() => setShowModal(true)}
              osSelecionada={osSelecionada}
            />
          )}
        </div>

        {/* Modal */}
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
