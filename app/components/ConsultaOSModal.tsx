"use client";

import { useState } from "react";
import type { OrdemServico } from "../types/os";

interface ConsultaOSModalProps {
  onClose: () => void;
  onSelectOS: (os: OrdemServico) => void;
}

export default function ConsultaOSModal({
  onClose,
  onSelectOS,
}: ConsultaOSModalProps) {
  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState<OrdemServico[]>([]);

  async function pesquisar() {
    if (!busca.trim()) return;
    const res = await fetch(`/api/os?numero=${busca}`);
    const data: OrdemServico[] = await res.json();
    setLista(data);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-[500px] space-y-4 shadow">
        <h2 className="text-lg font-bold">Consultar OS</h2>

        <input
          className="border px-2 py-1 rounded w-full"
          placeholder="Digite o número da OS"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && pesquisar()}
        />

        <button
          onClick={pesquisar}
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Buscar
        </button>

        <div className="max-h-64 overflow-y-auto border p-2 rounded">
          {lista.map((os) => (
            <div
              key={os.numero}
              className="p-2 border-b flex justify-between cursor-pointer hover:bg-slate-100"
              onClick={() => onSelectOS(os)}
            >
              <span>{os.numero}</span>
              <span>{os.cliente}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-400 text-white rounded"
        >
          Fechar
        </button>
      </div>
    </div>
  );
}
