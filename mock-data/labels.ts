export interface Label {
  id: string;
  name: string;
  color: string;
}

export const labels: Label[] = [
  {
    id: "post",
    name: "Post",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
  },
  {
    id: "story",
    name: "Story",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
  },
  {
    id: "reel",
    name: "Reel",
    color: "bg-pink-100 text-pink-700 dark:bg-pink-950/50 dark:text-pink-400",
  },
  {
    id: "carrusel",
    name: "Carrusel",
    color: "bg-cyan-100 text-cyan-700 dark:bg-cyan-950/50 dark:text-cyan-400",
  },
  {
    id: "urgente",
    name: "Urgente",
    color: "bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400",
  },
  {
    id: "instagram",
    name: "Instagram",
    color: "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 dark:from-purple-950/50 dark:to-pink-950/50 dark:text-purple-400",
  },
  {
    id: "facebook",
    name: "Facebook",
    color: "bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-400",
  },
  {
    id: "tiktok",
    name: "TikTok",
    color: "bg-slate-100 text-slate-700 dark:bg-slate-950/50 dark:text-slate-400",
  },
];
