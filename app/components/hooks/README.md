# Hooks Customizados

Este diretório contém hooks customizados reutilizáveis para melhorar a separação de responsabilidades e reduzir a duplicação de código na aplicação.

## Estrutura dos Hooks

### Hooks de Utilidades

#### `useApiError.ts`

Hook para tratamento padronizado de erros da API.

**Retorna:**

- `getApiErrorMessage(error, fallback)`: Função para extrair mensagens de erro da API de forma consistente.

#### `useDateTime.ts`

Hook para formatação de data e hora.

**Retorna:**

- `formatarDataHoraAtual()`: Função que retorna data e hora atual no formato "DD/MM/AAAA HH:MM:SS".

#### `useNavigation.ts`

Hook para navegação e cancelamento padronizado.

**Retorna:**

- `cancelarERedirecionarParaHome()`: Função para cancelar operações e redirecionar para a home.

### Hooks de Busca

#### `useBuscaOS.ts`

Hook para busca de Ordens de Serviço.

**Estado:**

- `osInfo`: Informações da OS encontrada
- `referencia`: Texto de referência da OS
- `erroBuscaOS`: Mensagem de erro da busca
- `buscandoOS`: Estado de carregamento

**Funções:**

- `consultarOS(numero)`: Busca uma OS simples
- `consultarOSCompleta(numero)`: Busca OS com divisões (para Evento1015)
- `limparBuscaOS()`: Limpa dados da busca
- `setReferencia(ref)`: Define referência manualmente

#### `useBuscaOperador.ts`

Hook para busca de operadores.

**Estado:**

- `nomeOperador`: Nome do operador encontrado
- `erroOperador`: Mensagem de erro da busca
- `buscandoOperador`: Estado de carregamento

**Funções:**

- `consultarOperador(codigo)`: Busca operador por código
- `limparOperador()`: Limpa dados do operador

#### `useBuscaServico.ts`

Hook para busca de serviços (usado no Evento19).

**Estado:**

- `descricaoServico`: Descrição do serviço encontrado
- `erroServico`: Mensagem de erro da busca
- `buscandoServico`: Estado de carregamento

**Funções:**

- `consultarServico(codigo)`: Busca serviço por código
- `limparServico()`: Limpa dados do serviço

#### `useBuscaInstrumento.ts`

Hook para busca de instrumentos (usado no Evento19).

**Estado:**

- `descricaoInstrumento`: Descrição do instrumento encontrado
- `erroInstrumento`: Mensagem de erro da busca
- `buscandoInstrumento`: Estado de carregamento

**Funções:**

- `consultarInstrumento(codigo)`: Busca instrumento por código
- `limparInstrumento()`: Limpa dados do instrumento

#### `useBuscaPosto.ts`

Hook para busca de postos de trabalho (usado no Evento1015).

**Estado:**

- `descricaoPosto`: Descrição do posto encontrado
- `erroPosto`: Mensagem de erro da busca
- `buscandoPosto`: Estado de carregamento

**Funções:**

- `consultarPosto(codigo)`: Busca posto por código
- `limparPosto()`: Limpa dados do posto

#### `useBuscaCarga.ts`

Hook para busca de cargas (específico para Evento1015).

**Estado:**

- `erroBuscaCarga`: Mensagem de erro da busca
- `buscandoCarga`: Estado de carregamento

**Funções:**

- `consultarCarga(numero)`: Busca carga e retorna `{ linhas, referencia }`

### Hook de Ações

#### `useSalvarEvento.ts`

Hook para salvamento de eventos com tratamento padronizado.

**Estado:**

- `salvando`: Estado de carregamento do salvamento

**Funções:**

- `salvarEvento(payload, titulo)`: Salva evento com formatação automática de data/hora e tratamento de erros

## Como Usar

### Exemplo no componente:

```tsx
import {
  useBuscaOS,
  useBuscaOperador,
  useSalvarEvento,
  useNavigation,
} from "../components/hooks";

export default function MeuComponente() {
  const { osInfo, referencia, erroBuscaOS, buscandoOS, consultarOS } =
    useBuscaOS();

  const { nomeOperador, erroOperador, buscandoOperador, consultarOperador } =
    useBuscaOperador();

  const { salvando, salvarEvento } = useSalvarEvento();
  const { cancelarERedirecionarParaHome } = useNavigation();

  const handleConsultarOS = async () => {
    await consultarOS("123456");
  };

  const handleSalvar = async () => {
    const payload = {
      numero_os: "123456",
      codigo_pessoa: "OP001",
      tipo_lcto: "10",
    };

    await salvarEvento(payload, "Meu Evento");
  };

  // ... resto do componente
}
```

## Benefícios

1. **Reutilização de Código**: Lógica comum extraída em hooks reutilizáveis
2. **Separação de Responsabilidades**: Componentes focam apenas na UI
3. **Consistência**: Comportamento padronizado entre componentes
4. **Manutenibilidade**: Mudanças na lógica de negócio centralizadas nos hooks
5. **Testabilidade**: Hooks podem ser testados independentemente dos componentes

## Componentes Refatorados

- `Evento19.tsx`: Usa hooks para busca de OS, serviços, operadores, instrumentos, salvamento e navegação
- `Evento1015.tsx`: Usa hooks para busca de OS/cargas, operadores, postos, salvamento e navegação

Os componentes ficaram mais limpos e focados na apresentação, com a lógica de negócio extraída para os hooks customizados.
