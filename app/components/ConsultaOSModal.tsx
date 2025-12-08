"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
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
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[500px] shadow-lg overflow-hidden">
        <div className="flex items-center justify-between bg-[#3C787A] px-6 py-4">
          <h2 className="text-lg font-bold text-white">Consultar OS</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <input
              className="border border-gray-300 px-3 py-2 rounded-lg flex-1 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 h-10 placeholder:text-gray-400 text-gray-700"
              placeholder="Digite o número da OS"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && pesquisar()}
            />
            <button
              onClick={pesquisar}
              className="h-10 w-10 bg-[#3C787A] text-white rounded-lg cursor-pointer hover:bg-[#2d5c5e] transition-colors flex items-center justify-center"
              aria-label="Pesquisar OS"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>

          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {lista.length > 0
              ? lista.map((os) => (
                  <div
                    key={os.numero}
                    className="p-3 border-b border-gray-100 last:border-b-0 flex justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => onSelectOS(os)}
                  >
                    <span className="font-medium">{os.numero}</span>
                    <span className="text-gray-600">{os.cliente}</span>
                  </div>
                ))
              : busca && (
                  <div className="p-4 text-center text-gray-500">
                    Nenhuma OS encontrada
                  </div>
                )}
          </div>
        </div>
      </div>
    </div>
  );
}
