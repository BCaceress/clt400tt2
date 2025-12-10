export interface OrdemServico {
  numero: string;
  cliente: string;
  detalhes?: OrdemServicoDetalhada;
}

export interface ServicoDivisao {
  tipo_servico: string;
  descricao_servico: string;
  sequencial_servico: number;
  unidade_medida: string;
  fase: string;
  programar: string;
  situacao_servico: string;
  codigo_processo: number;
  descricao_processo: string;
  numero_carga: number;
  data_hora_inicio: string;
  data_hora_termino: string;
  observacao: string;
}

export interface DivisaoOS {
  divisao: number;
  quantidade: number;
  origem: string;
  servicos: ServicoDivisao[];
}

export interface OrdemServicoDetalhada {
  numero_os: number;
  quantidade_os: number;
  codigo_empresa: number;
  descricao_empresa: string;
  data_entrada: string;
  data_prometida: string;
  codigo_tipo_processo: number;
  descricao_processo: string;
  divisoes: DivisaoOS[];
}
