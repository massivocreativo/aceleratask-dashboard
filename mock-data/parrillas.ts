import { Label, labels } from "./labels";
import { Status, statuses } from "./statuses";
import { User, users } from "./users";
import { Client, clients } from "./clients";

export interface Comment {
    id: string;
    userId: string;
    content: string;
    timestamp: string;
    imageIndex?: number; // Si el comentario es sobre una imagen específica
}

export interface ImageAnnotation {
    id: string;
    imageIndex: number;
    dataUrl: string; // Canvas drawing as base64
    userId: string;
    timestamp: string;
}

export interface ParrillaImage {
    id: string;
    url: string;
    caption?: string;
    annotations: ImageAnnotation[];
}

export interface Parrilla {
    id: string;
    title: string;
    description: string;
    status: Status;
    client: Client;
    assignees: User[];
    labels: Label[];
    dueDate?: string;
    createdAt: string;
    images: ParrillaImage[];
    comments: Comment[];
    priority: "low" | "medium" | "high" | "urgent";
}

// Sample parrillas data
export const parrillas: Parrilla[] = [
    // Contenido - Parrillas en fase de contenido
    {
        id: "par-1",
        title: "Parrilla Enero - Semana 2",
        description: "6 posts promocionales para campaña de año nuevo",
        status: statuses[0], // contenido
        client: clients[0], // Café Aroma
        assignees: [users[0]], // CM
        labels: [labels[0], labels[5]], // Post, Instagram
        dueDate: "2026-01-20",
        createdAt: "2026-01-13",
        images: [],
        comments: [],
        priority: "high",
    },
    {
        id: "par-2",
        title: "Parrilla Stories Enero",
        description: "Stories diarias para engagement",
        status: statuses[0],
        client: clients[1], // TechStart
        assignees: [users[1]],
        labels: [labels[1], labels[5]], // Story, Instagram
        dueDate: "2026-01-18",
        createdAt: "2026-01-12",
        images: [],
        comments: [],
        priority: "medium",
    },
    {
        id: "par-3",
        title: "Reels Promocionales",
        description: "3 reels para nueva colección",
        status: statuses[0],
        client: clients[3], // Beauty Glow
        assignees: [users[2]],
        labels: [labels[2], labels[5]], // Reel, Instagram
        dueDate: "2026-01-22",
        createdAt: "2026-01-13",
        images: [],
        comments: [],
        priority: "urgent",
    },

    // Diseño - Parrillas en fase de diseño
    {
        id: "par-4",
        title: "Carrusel Productos Nuevos",
        description: "Carrusel de 10 slides con productos de temporada",
        status: statuses[1], // diseño
        client: clients[5], // Fresh Foods
        assignees: [users[0], users[5]], // CM + Designer
        labels: [labels[3], labels[5]], // Carrusel, Instagram
        dueDate: "2026-01-17",
        createdAt: "2026-01-10",
        images: [
            { id: "img-1", url: "https://picsum.photos/seed/food1/1080/1350", annotations: [] },
            { id: "img-2", url: "https://picsum.photos/seed/food2/1080/1350", annotations: [] },
            { id: "img-3", url: "https://picsum.photos/seed/food3/1080/1350", annotations: [] },
            { id: "img-4", url: "https://picsum.photos/seed/food4/1080/1350", annotations: [] },
            { id: "img-5", url: "https://picsum.photos/seed/food5/1080/1350", annotations: [] },
            { id: "img-6", url: "https://picsum.photos/seed/food6/1080/1350", annotations: [] },
        ],
        comments: [
            {
                id: "com-1",
                userId: "cm-1",
                content: "Por favor mantener los colores de la marca en todos los slides",
                timestamp: "2026-01-11T10:30:00",
            },
        ],
        priority: "high",
    },
    {
        id: "par-5",
        title: "Posts Promoción Fitness",
        description: "6 posts para nueva rutina de ejercicios",
        status: statuses[1],
        client: clients[2], // Fitness Pro
        assignees: [users[1], users[6]],
        labels: [labels[0], labels[5], labels[7]], // Post, Instagram, TikTok
        dueDate: "2026-01-16",
        createdAt: "2026-01-09",
        images: [
            { id: "img-7", url: "https://picsum.photos/seed/fitness1/1080/1080", annotations: [] },
            { id: "img-8", url: "https://picsum.photos/seed/fitness2/1080/1080", annotations: [] },
            { id: "img-9", url: "https://picsum.photos/seed/fitness3/1080/1080", annotations: [] },
            { id: "img-10", url: "https://picsum.photos/seed/fitness4/1080/1080", annotations: [] },
            { id: "img-11", url: "https://picsum.photos/seed/fitness5/1080/1080", annotations: [] },
            { id: "img-12", url: "https://picsum.photos/seed/fitness6/1080/1080", annotations: [] },
        ],
        comments: [],
        priority: "medium",
    },

    // Cambios - Parrillas con revisiones pendientes
    {
        id: "par-6",
        title: "Parrilla Stilo Urbano",
        description: "Posts de moda urbana para febrero",
        status: statuses[2], // cambios
        client: clients[4], // Urban Style
        assignees: [users[2], users[7]],
        labels: [labels[0], labels[5]],
        dueDate: "2026-01-15",
        createdAt: "2026-01-05",
        images: [
            { id: "img-13", url: "https://picsum.photos/seed/urban1/1080/1350", annotations: [] },
            { id: "img-14", url: "https://picsum.photos/seed/urban2/1080/1350", annotations: [] },
            { id: "img-15", url: "https://picsum.photos/seed/urban3/1080/1350", annotations: [] },
            { id: "img-16", url: "https://picsum.photos/seed/urban4/1080/1350", annotations: [] },
            { id: "img-17", url: "https://picsum.photos/seed/urban5/1080/1350", annotations: [] },
            { id: "img-18", url: "https://picsum.photos/seed/urban6/1080/1350", annotations: [] },
        ],
        comments: [
            {
                id: "com-2",
                userId: "cm-3",
                content: "El post 3 necesita cambiar la tipografía, usar Montserrat Bold",
                timestamp: "2026-01-14T09:15:00",
                imageIndex: 2,
            },
            {
                id: "com-3",
                userId: "cm-3",
                content: "En el post 5, el logo está muy pequeño",
                timestamp: "2026-01-14T09:20:00",
                imageIndex: 4,
            },
        ],
        priority: "urgent",
    },
    {
        id: "par-7",
        title: "Stories Auto Elite",
        description: "Stories de lanzamiento nuevo modelo",
        status: statuses[2],
        client: clients[6], // Auto Elite
        assignees: [users[3], users[8]],
        labels: [labels[1], labels[5], labels[4]], // Story, Instagram, Urgente
        dueDate: "2026-01-14",
        createdAt: "2026-01-08",
        images: [
            { id: "img-19", url: "https://picsum.photos/seed/auto1/1080/1920", annotations: [] },
            { id: "img-20", url: "https://picsum.photos/seed/auto2/1080/1920", annotations: [] },
            { id: "img-21", url: "https://picsum.photos/seed/auto3/1080/1920", annotations: [] },
            { id: "img-22", url: "https://picsum.photos/seed/auto4/1080/1920", annotations: [] },
            { id: "img-23", url: "https://picsum.photos/seed/auto5/1080/1920", annotations: [] },
            { id: "img-24", url: "https://picsum.photos/seed/auto6/1080/1920", annotations: [] },
        ],
        comments: [
            {
                id: "com-4",
                userId: "cm-4",
                content: "Necesitamos agregar el CTA 'Reserva ahora' en todas las stories",
                timestamp: "2026-01-13T16:00:00",
            },
        ],
        priority: "urgent",
    },

    // Entrega Final - Parrillas listas
    {
        id: "par-8",
        title: "Parrilla Dental Enero",
        description: "Content educativo sobre salud dental",
        status: statuses[3], // entrega-final
        client: clients[8], // Dental Care
        assignees: [users[4], users[9]],
        labels: [labels[0], labels[5], labels[6]], // Post, Instagram, Facebook
        dueDate: "2026-01-12",
        createdAt: "2026-01-02",
        images: [
            { id: "img-25", url: "https://picsum.photos/seed/dental1/1080/1080", annotations: [] },
            { id: "img-26", url: "https://picsum.photos/seed/dental2/1080/1080", annotations: [] },
            { id: "img-27", url: "https://picsum.photos/seed/dental3/1080/1080", annotations: [] },
            { id: "img-28", url: "https://picsum.photos/seed/dental4/1080/1080", annotations: [] },
            { id: "img-29", url: "https://picsum.photos/seed/dental5/1080/1080", annotations: [] },
            { id: "img-30", url: "https://picsum.photos/seed/dental6/1080/1080", annotations: [] },
        ],
        comments: [
            {
                id: "com-5",
                userId: "cm-5",
                content: "¡Excelente trabajo! Aprobado para publicar.",
                timestamp: "2026-01-12T11:00:00",
            },
        ],
        priority: "medium",
    },
    {
        id: "par-9",
        title: "Reels Travel Dreams",
        description: "Reels destinos exóticos 2026",
        status: statuses[3],
        client: clients[9], // Travel Dreams
        assignees: [users[0], users[10]],
        labels: [labels[2], labels[5], labels[7]], // Reel, Instagram, TikTok
        dueDate: "2026-01-11",
        createdAt: "2026-01-01",
        images: [
            { id: "img-31", url: "https://picsum.photos/seed/travel1/1080/1920", annotations: [] },
            { id: "img-32", url: "https://picsum.photos/seed/travel2/1080/1920", annotations: [] },
            { id: "img-33", url: "https://picsum.photos/seed/travel3/1080/1920", annotations: [] },
            { id: "img-34", url: "https://picsum.photos/seed/travel4/1080/1920", annotations: [] },
            { id: "img-35", url: "https://picsum.photos/seed/travel5/1080/1920", annotations: [] },
            { id: "img-36", url: "https://picsum.photos/seed/travel6/1080/1920", annotations: [] },
        ],
        comments: [],
        priority: "low",
    },
];

export function groupParrillasByStatus(parrillas: Parrilla[]): Record<string, Parrilla[]> {
    return parrillas.reduce<Record<string, Parrilla[]>>((acc, parrilla) => {
        const statusId = parrilla.status.id;

        if (!acc[statusId]) {
            acc[statusId] = [];
        }

        acc[statusId].push(parrilla);

        return acc;
    }, {});
}
