import React from "react";

// Iconos de estado como componentes React
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

// Mapeo de nombres de íconos (string) a componentes React
export const statusIconMap: Record<string, React.FC> = {
    contenido: ContenidoIcon,
    diseno: DisenoIcon,
    cambios: CambiosIcon,
    "entrega-final": EntregaFinalIcon,
};

// Helper para obtener el componente de ícono desde un string
export function getStatusIcon(iconName: string | null): React.FC {
    if (!iconName || !statusIconMap[iconName]) {
        // Ícono por defecto si no se encuentra
        return ContenidoIcon;
    }
    return statusIconMap[iconName];
}
