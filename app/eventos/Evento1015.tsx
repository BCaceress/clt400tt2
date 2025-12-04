"use client";

import { useState } from "react";
import { Save } from "lucide-react";
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

  const titulo = tipoEvento === 10 ? "Início de Carga" : "Término de Carga";
  const eventoTexto = tipoEvento === 10 ? "evento 10" : "evento 15";

  function salvar() {
    console.log(`Enviando ${eventoTexto}:`, data);
    alert(`${titulo} salvo!`);
  }

  return (
    <div className="border-t pt-4 space-y-3">
      <h2 className="font-bold text-lg text-gray-800">{titulo}</h2>

      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Nº da Carga
        </label>
        <input
          className="border px-2 py-1 rounded w-full"
          value={data.num_carga}
          onChange={(e) => setData({ ...data, num_carga: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Nº da OS
        </label>
        <div className="flex gap-2 items-center">
          <input
            className="border px-2 py-1 rounded flex-1"
            value={data.num_os}
            onChange={(e) => setData({ ...data, num_os: e.target.value })}
          />
         
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Posto de Trabalho
        </label>
        <input
          className="border px-2 py-1 rounded w-full"
          value={data.posto_trab}
          onChange={(e) => setData({ ...data, posto_trab: e.target.value })}
        />
      </div>

      <div>
        <label className="block text-sm font-semibold mb-1 text-gray-700">
          Operador
        </label>
        <input
          className="border px-2 py-1 rounded w-full"
          value={data.operador}
          onChange={(e) => setData({ ...data, operador: e.target.value })}
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={salvar}
          className="text-white px-4 py-2 rounded flex items-center gap-2"
          style={{ backgroundColor: "#3C787A" }}
        >
          <Save size={16} />
          Salvar
        </button>
      </div>
    </div>
  );
}
