import type { ComponentType } from "react";
import { createElement } from "react";
import type { OrdemServico } from "../types/os";
import Evento1015 from "./Evento1015";
import Evento19 from "./Evento19";

export interface EventoProps {
  onConsultarOS: () => void;
  osSelecionada: OrdemServico | null;
  dataHoraCustomizada?: string;
}

// Wrappers para os eventos 10 e 15
const Evento10 = (props: EventoProps) => {
  return createElement(Evento1015, { tipoEvento: 10, ...props });
};

const Evento15 = (props: EventoProps) => {
  return createElement(Evento1015, { tipoEvento: 15, ...props });
};

export const EVENTO_COMPONENTS: Record<number, ComponentType<EventoProps>> = {
  10: Evento10,
  15: Evento15,
  19: Evento19,
};
