import React from "react";

export interface Status {
  id: string;
  name: string;
  color: string;
  icon: React.FC;
}

// Contenido - Azul (CM creando contenido)
export const ContenidoIcon: React.FC = () => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle
        cx="7"
        cy="7"
        r="6"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeDasharray="3.14 0"
        strokeDashoffset="-0.7"
      ></circle>
      <circle
        className="progress"
        cx="7"
        cy="7"
        r="2"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="4"
        strokeDasharray="0 100"
        strokeDashoffset="0"
        transform="rotate(-90 7 7)"
      ></circle>
    </svg>
  );
};

// Diseño - Amarillo (Diseñador trabajando)
export const DisenoIcon: React.FC = () => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle
        cx="7"
        cy="7"
        r="6"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="2"
        strokeDasharray="3.14 0"
        strokeDashoffset="-0.7"
      ></circle>
      <circle
        className="progress"
        cx="7"
        cy="7"
        r="2"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="4"
        strokeDasharray="3.12 100"
        strokeDashoffset="0"
        transform="rotate(-90 7 7)"
      ></circle>
    </svg>
  );
};

// Cambios - Naranja (Revisiones pendientes)
export const CambiosIcon: React.FC = () => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle
        cx="7"
        cy="7"
        r="6"
        fill="none"
        stroke="#f97316"
        strokeWidth="2"
        strokeDasharray="3.14 0"
        strokeDashoffset="-0.7"
      ></circle>
      <circle
        className="progress"
        cx="7"
        cy="7"
        r="2"
        fill="none"
        stroke="#f97316"
        strokeWidth="4"
        strokeDasharray="4.68 100"
        strokeDashoffset="0"
        transform="rotate(-90 7 7)"
      ></circle>
    </svg>
  );
};

// Entrega Final - Verde (Listo para entregar)
export const EntregaFinalIcon: React.FC = () => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle
        cx="7"
        cy="7"
        r="6"
        fill="none"
        stroke="#22c55e"
        strokeWidth="2"
        strokeDasharray="3.14 0"
        strokeDashoffset="-0.7"
      ></circle>
      <path
        d="M4.5 7L6.5 9L9.5 5"
        stroke="#22c55e"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const statuses: Status[] = [
  { id: "contenido", name: "Contenido", color: "#3b82f6", icon: ContenidoIcon },
  { id: "diseno", name: "Diseño", color: "#f59e0b", icon: DisenoIcon },
  { id: "cambios", name: "Cambios", color: "#f97316", icon: CambiosIcon },
  { id: "entrega-final", name: "Entrega Final", color: "#22c55e", icon: EntregaFinalIcon },
];

export const StatusIcon: React.FC<{ statusId: string }> = ({ statusId }) => {
  const currentStatus = statuses.find((s) => s.id === statusId);
  if (!currentStatus) return null;

  const IconComponent = currentStatus.icon;
  return <IconComponent />;
};
