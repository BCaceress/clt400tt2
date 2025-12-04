"use client";

import { useState } from "react";
import { Save, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { apiService } from "../services/api";
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

type Operador = {
  codigo_pessoa: string;
  nome: string;
  situacao: string;
};

type Posto = {
  codigo_posto: string;
  descricao: string;
  situacao: string;
  situacao_descricao: string;
};

type OrdemApiResponse = {
  numero_os: number;
  quantidade_os: number;
  divisoes: LinhaResultado[];
};

type CargaApiResponse = {
  numero_carga: number;
  oss: LinhaResultado[];
};

export default function Evento1015({
  tipoEvento,
  osSelecionada,
}: Evento1015Props) {
  const router = useRouter();
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
  const [nomeOperador, setNomeOperador] = useState<string>("");
  const [erroOperador, setErroOperador] = useState<string | null>(null);
  const [buscandoOperador, setBuscandoOperador] = useState(false);
  const [descricaoPosto, setDescricaoPosto] = useState<string>("");
  const [erroPosto, setErroPosto] = useState<string | null>(null);
  const [buscandoPosto, setBuscandoPosto] = useState(false);

  const titulo = tipoEvento === 10 ? "Início de Carga" : "Término de Carga";
  const eventoTexto = tipoEvento === 10 ? "evento 10" : "evento 15";

  function limparResultado() {
    setLinhas([]);
    setReferencia(null);
  }

  async function consultarCarga() {
    const numero = data.num_carga.trim();
    if (!numero) {
      setErroBusca("Informe o número da carga para pesquisar.");
      limparResultado();
      return;
    }

    setErroBusca(null);
    setBuscando(true);
    try {
      const resposta = await apiService.get<CargaApiResponse>(
        `/cargas?numero_carga=${encodeURIComponent(numero)}`
      );
      const dados = resposta.oss ?? [];
      setLinhas(dados);
      setReferencia(`Carga ${resposta.numero_carga}`);
      if (dados.length === 0) {
        setErroBusca("Nenhuma OS encontrada para a carga informada.");
      }
    } catch (error) {
      console.error(error);
      setErroBusca("Não foi possível consultar a carga.");
      limparResultado();
    } finally {
      setBuscando(false);
    }
  }

  async function consultarOS() {
    const numero = data.num_os.trim();
    if (!numero) {
      setErroBusca("Informe o número da OS para pesquisar.");
      limparResultado();
      return;
    }

    setErroBusca(null);
    setBuscando(true);
    try {
      const resposta = await apiService.get<OrdemApiResponse>(
        `/ordens?numero_os=${encodeURIComponent(numero)}`
      );
      const dados = resposta.divisoes ?? [];
      const linhasComNumeroOS = dados.map((linha) => ({
        ...linha,
        numero_os: resposta.numero_os,
      }));
      setLinhas(linhasComNumeroOS);
      setReferencia(`OS ${resposta.numero_os}`);
      if (dados.length === 0) {
        setErroBusca("Nenhuma divisão encontrada para a OS informada.");
      }
    } catch (error) {
      console.error(error);
      setErroBusca("Não foi possível consultar a OS.");
      limparResultado();
    } finally {
      setBuscando(false);
    }
  }

  async function consultarOperador() {
    const codigo = data.operador.trim();
    if (!codigo) {
      setErroOperador("Informe o código do operador.");
      setNomeOperador("");
      return;
    }
    setErroOperador(null);
    setBuscandoOperador(true);
    try {
      const resposta = await apiService.get<Operador[]>(
        `/operadores?codigo_pessoa=${encodeURIComponent(codigo)}`
      );
      const operadorEncontrado = resposta?.[0];
      if (operadorEncontrado) {
        setNomeOperador(operadorEncontrado.nome);
      } else {
        setNomeOperador("");
        setErroOperador("Operador não encontrado.");
      }
    } catch (error) {
      console.error(error);
      setNomeOperador("");
      setErroOperador("Não foi possível consultar o operador.");
    } finally {
      setBuscandoOperador(false);
    }
  }

  async function consultarPosto() {
    const codigo = data.posto_trab.trim();
    if (!codigo) {
      setErroPosto("Informe o código do posto.");
      setDescricaoPosto("");
      return;
    }
    setErroPosto(null);
    setBuscandoPosto(true);
    try {
      const resposta = await apiService.get<Posto[]>(
        `/postos?codigo_posto=${encodeURIComponent(codigo)}`
      );
      const postoEncontrado = resposta?.[0];
      if (postoEncontrado) {
        setDescricaoPosto(postoEncontrado.descricao);
      } else {
        setDescricaoPosto("");
        setErroPosto("Posto não encontrado.");
      }
    } catch (error) {
      console.error(error);
      setDescricaoPosto("");
      setErroPosto("Não foi possível consultar o posto.");
    } finally {
      setBuscandoPosto(false);
    }
  }

  function salvar() {
    // Validar campos obrigatórios
    const erros: string[] = [];

    // Validar se tem carga ou OS
    if (!data.num_carga.trim() && !data.num_os.trim()) {
      erros.push("É necessário informar o número da carga ou da OS.");
    }

    // Validar se os campos foram pesquisados com sucesso
    if (data.num_carga.trim() && linhas.length === 0) {
      erros.push(
        "É necessário pesquisar e encontrar dados válidos para a carga."
      );
    }

    if (data.num_os.trim() && linhas.length === 0) {
      erros.push("É necessário pesquisar e encontrar dados válidos para a OS.");
    }

    // Validar posto de trabalho
    if (!data.posto_trab.trim()) {
      erros.push("O campo Posto de Trabalho é obrigatório.");
    } else if (!descricaoPosto || erroPosto) {
      erros.push(
        "É necessário pesquisar e encontrar um posto de trabalho válido."
      );
    }

    // Validar operador
    if (!data.operador.trim()) {
      erros.push("O campo Operador é obrigatório.");
    } else if (!nomeOperador || erroOperador) {
      erros.push("É necessário pesquisar e encontrar um operador válido.");
    }

    if (erros.length > 0) {
      alert("Erro(s) de validação:\n\n" + erros.join("\n"));
      return;
    }

    console.log(`Enviando ${eventoTexto}:`, data);
    alert(`${titulo} salvo!`);
  }

  function cancelar() {
    setData({
      num_carga: "",
      num_os: "",
      operador: "",
      posto_trab: "",
    });
    setLinhas([]);
    setReferencia(null);
    setErroBusca(null);
    setNomeOperador("");
    setErroOperador(null);
    setDescricaoPosto("");
    setErroPosto(null);
    if (typeof window !== "undefined") {
      window.location.href = "/";
    } else {
      router.push("/");
    }
  }

  return (
    <div className="border-t pt-4 space-y-4">
      <h2 className="font-bold text-lg text-gray-800">{titulo}</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Número da Carga
            </label>
            <div className="flex gap-2 items-center">
              <input
                className="border border-gray-300 px-2 py-1 rounded flex-1 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500"
                value={data.num_carga}
                onChange={(e) =>
                  setData({ ...data, num_carga: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && consultarCarga()}
                disabled={data.num_os.trim().length > 0}
              />
              <button
                type="button"
                onClick={consultarCarga}
                className="h-9 w-10 rounded bg-[#3C787A] text-white flex items-center justify-center hover:bg-[#2d5c5e] disabled:opacity-50 cursor-pointer"
                disabled={data.num_os.trim().length > 0}
              >
                <Search size={16} />
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Número da OS
            </label>
            <div className="flex gap-2 items-center">
              <input
                className="border border-gray-300 px-2 py-1 rounded flex-1 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 disabled:bg-gray-100 disabled:text-gray-500"
                value={data.num_os}
                onChange={(e) => setData({ ...data, num_os: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && consultarOS()}
                disabled={data.num_carga.trim().length > 0}
              />
              <button
                type="button"
                onClick={consultarOS}
                className="h-9 w-10 rounded bg-[#3C787A] text-white flex items-center justify-center hover:bg-[#2d5c5e] disabled:opacity-50 cursor-pointer"
                disabled={data.num_carga.trim().length > 0}
              >
                <Search size={16} />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 my-5" />

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Posto de Trabalho *
            </label>
            <div className="flex gap-2 items-center">
              <input
                className="border border-gray-300 px-2 py-1 rounded flex-1 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
                value={data.posto_trab}
                onChange={(e) =>
                  setData({ ...data, posto_trab: e.target.value })
                }
                onKeyDown={(e) => e.key === "Enter" && consultarPosto()}
              />
              <button
                type="button"
                onClick={consultarPosto}
                className="h-9 w-10 rounded bg-[#3C787A] text-white flex items-center justify-center hover:bg-[#2d5c5e] cursor-pointer"
              >
                <Search size={16} />
              </button>
            </div>
            <div className="mt-1 text-sm min-h-5">
              {buscandoPosto ? (
                <span className="text-gray-700">Buscando posto...</span>
              ) : descricaoPosto ? (
                <span className="text-gray-700">{descricaoPosto}</span>
              ) : erroPosto ? (
                <span className="text-red-600">{erroPosto}</span>
              ) : null}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Operador *
            </label>
            <div className="flex gap-2 items-center">
              <input
                className="border border-gray-300 px-2 py-1 rounded flex-1 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300"
                value={data.operador}
                onChange={(e) => setData({ ...data, operador: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && consultarOperador()}
              />
              <button
                type="button"
                onClick={consultarOperador}
                className="h-9 w-10 rounded bg-[#3C787A] text-white flex items-center justify-center hover:bg-[#2d5c5e] cursor-pointer"
              >
                <Search size={16} />
              </button>
            </div>
            <div className="mt-1 text-sm min-h-5">
              {buscandoOperador ? (
                <span className="text-gray-700">Buscando operador...</span>
              ) : nomeOperador ? (
                <span className="text-gray-700">{nomeOperador}</span>
              ) : erroOperador ? (
                <span className="text-red-600">{erroOperador}</span>
              ) : null}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 border rounded-lg p-4 space-y-3 h-full">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-800">Resultados</p>
              <p className="text-xs text-gray-600">
                Pesquise por carga ou OS para listar divisão e quantidade.
              </p>
            </div>
            {referencia && (
              <span className="text-xs font-semibold text-gray-700 bg-white border px-2 py-1 rounded">
                {referencia}
              </span>
            )}
          </div>

          {erroBusca && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
              {erroBusca}
            </div>
          )}

          {buscando ? (
            <p className="text-sm text-gray-700">Buscando informações...</p>
          ) : linhas.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-800">
                <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
                  <tr>
                    <th className="px-3 py-2 border">OS</th>
                    <th className="px-3 py-2 border">Divisão</th>
                    <th className="px-3 py-2 border text-right">Quantidade</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((linha) => (
                    <tr key={`${linha.numero_os ?? "os"}-${linha.divisao}`}>
                      <td className="px-3 py-2 border">
                        {linha.numero_os ??
                          (data.num_os ||
                            (referencia?.startsWith("OS ")
                              ? referencia.replace("OS ", "")
                              : ""))}
                      </td>
                      <td className="px-3 py-2 border">{linha.divisao}</td>
                      <td className="px-3 py-2 border text-right">
                        {linha.quantidade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-600">
              Nenhum resultado para exibir. Pesquise por carga ou OS.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={cancelar}
          className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 cursor-pointer"
          type="button"
        >
          Cancelar
        </button>
        <button
          onClick={salvar}
          className="text-white px-4 py-2 rounded flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#3C787A" }}
        >
          <Save size={16} />
          Salvar
        </button>
      </div>
    </div>
  );
}
