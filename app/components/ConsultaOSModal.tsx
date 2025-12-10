"use client";

import { useState } from "react";
import { X, Search } from "lucide-react";
import type {
  DivisaoOS,
  OrdemServico,
  OrdemServicoDetalhada,
} from "../types/os";
import { apiService } from "../services/api";

interface ConsultaOSModalProps {
  onClose: () => void;
  onSelectOS: (os: OrdemServico) => void;
}

export default function ConsultaOSModal({ onClose }: ConsultaOSModalProps) {
  const [busca, setBusca] = useState("");
  const [resultado, setResultado] = useState<OrdemServicoDetalhada | null>(
    null
  );
  const [divisaoAtiva, setDivisaoAtiva] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function pesquisar() {
    if (!busca.trim()) return;
    setCarregando(true);
    setErro(null);
    setResultado(null);
    setDivisaoAtiva(null);

    try {
      const data = await apiService.get<
        OrdemServicoDetalhada | OrdemServicoDetalhada[]
      >(`/ordens?numero_os=${encodeURIComponent(busca)}&completo=S`);
      const ordem: OrdemServicoDetalhada | undefined = Array.isArray(data)
        ? data[0]
        : data;

      if (!ordem || !ordem.numero_os) {
        setErro("Nenhuma OS encontrada para o número informado.");
        return;
      }

      setResultado(ordem);
      setDivisaoAtiva(ordem.divisoes?.[0]?.divisao ?? null);
    } catch (error) {
      console.error(error);
      setErro("Nao foi possivel buscar a OS. Tente novamente em instantes.");
    } finally {
      setCarregando(false);
    }
  }

  function limparEFechar() {
    setBusca("");
    setResultado(null);
    setDivisaoAtiva(null);
    setErro(null);
    setCarregando(false);
    onClose();
  }

  function formatarNumero(valor: number) {
    if (Number.isNaN(valor)) return "-";
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 3,
    }).format(valor);
  }

  function valorOuTraco(valor?: string | number | null) {
    if (valor === undefined || valor === null) return "-";
    if (typeof valor === "number" && valor === 0) return "-";
    const texto = valor.toString().trim();
    return texto.length > 0 ? texto : "-";
  }

  const divisaoSelecionada: DivisaoOS | undefined = resultado?.divisoes.find(
    (div) => div.divisao === divisaoAtiva
  );

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div
        className={`bg-white rounded-xl w-full shadow-lg overflow-hidden max-h-[90vh] overflow-y-auto ${
          resultado ? "max-w-[95vw]" : "max-w-xl"
        }`}
      >
        <div className="flex items-center justify-between bg-[#3C787A] px-6 py-4">
          <h2 className="text-lg font-bold text-white">
            {resultado
              ? `Consulta de OS - ${resultado.numero_os}`
              : "Consultar OS"}
          </h2>
          <button
            onClick={limparEFechar}
            className="p-1 hover:bg-white/10 rounded-full transition-colors cursor-pointer"
            aria-label="Fechar modal"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          {!resultado && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  className="border border-gray-300 px-3 py-2 rounded-lg flex-1 focus:outline-none focus:ring-1 focus:ring-gray-500 focus:border-gray-500 h-10 placeholder:text-gray-400 text-gray-700"
                  placeholder="Digite o numero da OS"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !carregando) {
                      e.preventDefault();
                      pesquisar();
                    }
                  }}
                  disabled={carregando}
                />
                <button
                  onClick={pesquisar}
                  className="h-10 w-10 bg-[#3C787A] text-white rounded-lg cursor-pointer hover:bg-[#2d5c5e] transition-colors flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
                  aria-label="Pesquisar OS"
                  disabled={carregando}
                >
                  {carregando ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </button>
              </div>
              {erro && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {erro}
                </div>
              )}
            </div>
          )}

          {resultado ? (
            <div className="space-y-5">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-50 border border-gray-200 rounded-lg p-2 md:p-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Empresa
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {resultado.codigo_empresa} - {resultado.descricao_empresa}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Referência
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {valorOuTraco(
                      resultado.descricao_processo ||
                        `Processo ${resultado.codigo_tipo_processo}`
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Número OS
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {resultado.numero_os}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Data entrada
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {valorOuTraco(resultado.data_entrada)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Data prometida
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {valorOuTraco(resultado.data_prometida)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Quantidade total
                  </p>
                  <p className="text-sm font-semibold text-gray-800">
                    {formatarNumero(resultado.quantidade_os)}
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center gap-2 bg-gray-50 border-b border-gray-200 px-2 md:px-4 py-3 overflow-x-auto">
                  {resultado.divisoes.map((divisao) => (
                    <button
                      key={divisao.divisao}
                      onClick={() => setDivisaoAtiva(divisao.divisao)}
                      className={`px-3 py-2 text-sm rounded-lg border cursor-pointer transition-colors whitespace-nowrap ${
                        divisaoAtiva === divisao.divisao
                          ? "bg-[#3C787A] text-white border-[#3C787A]"
                          : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      Divisão {divisao.divisao} (
                      {formatarNumero(divisao.quantidade)})
                    </button>
                  ))}
                </div>

                {divisaoSelecionada &&
                divisaoSelecionada.servicos.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-sm text-left text-gray-800">
                      <thead className="bg-gray-50 text-gray-700">
                        <tr>
                          <th className="px-2 md:px-4 py-3 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 min-w-[60px]">
                            Seq
                          </th>
                          <th className="px-2 md:px-4 py-3 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 min-w-[80px]">
                            Código
                          </th>
                          <th className="px-2 md:px-4 py-3 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 min-w-[150px]">
                            Serviço
                          </th>
                          <th className="px-2 md:px-4 py-3 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 min-w-[100px]">
                            Situação
                          </th>
                          <th className="px-2 md:px-4 py-3 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 min-w-[120px]">
                            Processo
                          </th>
                          <th className="px-2 md:px-4 py-3 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 min-w-[80px]">
                            Carga
                          </th>
                          <th className="px-2 md:px-4 py-3 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 min-w-[120px]">
                            Início
                          </th>
                          <th className="px-2 md:px-4 py-3 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 min-w-[120px]">
                            Término
                          </th>
                          <th className="px-2 md:px-4 py-3 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 min-w-[180px]">
                            Instrução de trabalho
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {divisaoSelecionada.servicos.map((servico, index) => (
                          <tr
                            key={`${servico.sequencial_servico}-${servico.tipo_servico}-${index}`}
                            className={
                              index % 2 === 0 ? "bg-white" : "bg-gray-50"
                            }
                          >
                            <td className="px-2 md:px-4 py-3 border-b border-gray-200 min-w-[60px]">
                              {servico.sequencial_servico}
                            </td>
                            <td className="px-2 md:px-4 py-3 border-b border-gray-200 min-w-[80px]">
                              {valorOuTraco(servico.tipo_servico)}
                            </td>
                            <td className="px-2 md:px-4 py-3 border-b border-gray-200 min-w-[150px]">
                              {valorOuTraco(servico.descricao_servico)}
                            </td>
                            <td className="px-2 md:px-4 py-3 border-b border-gray-200 min-w-[100px]">
                              {valorOuTraco(servico.situacao_servico)}
                            </td>
                            <td className="px-2 md:px-4 py-3 border-b border-gray-200 min-w-[120px]">
                              {valorOuTraco(
                                servico.descricao_processo ||
                                  servico.codigo_processo
                              )}
                            </td>
                            <td className="px-2 md:px-4 py-3 border-b border-gray-200 min-w-[80px]">
                              {valorOuTraco(
                                servico.numero_carga === 0
                                  ? "-"
                                  : servico.numero_carga
                              )}
                            </td>
                            <td className="px-2 md:px-4 py-3 border-b border-gray-200 min-w-[120px]">
                              {valorOuTraco(servico.data_hora_inicio)}
                            </td>
                            <td className="px-2 md:px-4 py-3 border-b border-gray-200 min-w-[120px]">
                              {valorOuTraco(servico.data_hora_termino)}
                            </td>
                            <td className="px-2 md:px-4 py-3 border-b border-gray-200 min-w-[180px]">
                              {valorOuTraco(servico.observacao)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-3 md:p-6 text-sm text-gray-600">
                    Nenhum servico encontrado para esta divisao.
                  </div>
                )}
              </div>

              <div className="flex flex-row justify-end gap-2">
                <button
                  onClick={() => {
                    setResultado(null);
                    setDivisaoAtiva(null);
                  }}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors text-sm font-medium"
                  type="button"
                >
                  Nova consulta
                </button>
                <button
                  onClick={limparEFechar}
                  className="px-4 py-2 rounded-lg bg-[#3C787A] text-white hover:bg-[#2d5c5e] cursor-pointer transition-colors text-sm font-semibold"
                  type="button"
                >
                  Voltar para tela inicial
                </button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-gray-600 border border-dashed border-gray-300 rounded-lg p-6 text-center">
              {carregando
                ? "Buscando dados da OS..."
                : "Informe o numero da OS e clique em pesquisar para visualizar os dados."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
