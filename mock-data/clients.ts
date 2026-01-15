export interface Client {
    id: string;
    name: string;
    logo?: string;
    instagramHandle?: string;
    facebookHandle?: string;
    tiktokHandle?: string;
    color: string;
}

export const clients: Client[] = [
    {
        id: "client-1",
        name: "Café Aroma",
        instagramHandle: "@cafearoma",
        color: "#8B4513",
    },
    {
        id: "client-2",
        name: "TechStart",
        instagramHandle: "@techstart_oficial",
        facebookHandle: "TechStartOficial",
        color: "#6366f1",
    },
    {
        id: "client-3",
        name: "Fitness Pro",
        instagramHandle: "@fitnesspro",
        tiktokHandle: "@fitnesspro",
        color: "#22c55e",
    },
    {
        id: "client-4",
        name: "Beauty Glow",
        instagramHandle: "@beautyglow",
        color: "#ec4899",
    },
    {
        id: "client-5",
        name: "Urban Style",
        instagramHandle: "@urbanstyle",
        color: "#1f2937",
    },
    {
        id: "client-6",
        name: "Fresh Foods",
        instagramHandle: "@freshfoods",
        facebookHandle: "FreshFoodsCo",
        color: "#84cc16",
    },
    {
        id: "client-7",
        name: "Auto Elite",
        instagramHandle: "@autoelite",
        color: "#ef4444",
    },
    {
        id: "client-8",
        name: "Pet Paradise",
        instagramHandle: "@petparadise",
        color: "#f59e0b",
    },
    {
        id: "client-9",
        name: "Dental Care",
        instagramHandle: "@dentalcare",
        color: "#06b6d4",
    },
    {
        id: "client-10",
        name: "Travel Dreams",
        instagramHandle: "@traveldreams",
        color: "#8b5cf6",
    },
    {
        id: "client-11",
        name: "Home Deco",
        instagramHandle: "@homedeco",
        color: "#a78bfa",
    },
    {
        id: "client-12",
        name: "Sport Zone",
        instagramHandle: "@sportzone",
        color: "#14b8a6",
    },
];
