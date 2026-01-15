export type UserRole = "cm" | "designer";

export interface User {
   id: string;
   name: string;
   email: string;
   avatar: string;
   role: UserRole;
}

// Content Managers
const contentManagers: User[] = [
   {
      id: "cm-1",
      name: "Ana García",
      email: "ana.garcia@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=AnaGarcia",
      role: "cm",
   },
   {
      id: "cm-2",
      name: "Carlos Mendoza",
      email: "carlos.mendoza@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=CarlosMendoza",
      role: "cm",
   },
   {
      id: "cm-3",
      name: "Laura Fernández",
      email: "laura.fernandez@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=LauraFernandez",
      role: "cm",
   },
   {
      id: "cm-4",
      name: "Miguel Torres",
      email: "miguel.torres@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=MiguelTorres",
      role: "cm",
   },
   {
      id: "cm-5",
      name: "Sofia Ruiz",
      email: "sofia.ruiz@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=SofiaRuiz",
      role: "cm",
   },
];

// Designers
const designers: User[] = [
   {
      id: "des-1",
      name: "Pablo Herrera",
      email: "pablo.herrera@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=PabloHerrera",
      role: "designer",
   },
   {
      id: "des-2",
      name: "María López",
      email: "maria.lopez@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=MariaLopez",
      role: "designer",
   },
   {
      id: "des-3",
      name: "Diego Martínez",
      email: "diego.martinez@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=DiegoMartinez",
      role: "designer",
   },
   {
      id: "des-4",
      name: "Valentina Sánchez",
      email: "valentina.sanchez@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=ValentinaSanchez",
      role: "designer",
   },
   {
      id: "des-5",
      name: "Andrés Gómez",
      email: "andres.gomez@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=AndresGomez",
      role: "designer",
   },
   {
      id: "des-6",
      name: "Camila Rodríguez",
      email: "camila.rodriguez@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=CamilaRodriguez",
      role: "designer",
   },
   {
      id: "des-7",
      name: "Luis Pérez",
      email: "luis.perez@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=LuisPerez",
      role: "designer",
   },
   {
      id: "des-8",
      name: "Isabella Castro",
      email: "isabella.castro@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=IsabellaCastro",
      role: "designer",
   },
   {
      id: "des-9",
      name: "Fernando Díaz",
      email: "fernando.diaz@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=FernandoDiaz",
      role: "designer",
   },
   {
      id: "des-10",
      name: "Lucía Morales",
      email: "lucia.morales@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=LuciaMorales",
      role: "designer",
   },
   {
      id: "des-11",
      name: "Javier Vargas",
      email: "javier.vargas@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=JavierVargas",
      role: "designer",
   },
   {
      id: "des-12",
      name: "Natalia Silva",
      email: "natalia.silva@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=NataliaSilva",
      role: "designer",
   },
   {
      id: "des-13",
      name: "Roberto Reyes",
      email: "roberto.reyes@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=RobertoReyes",
      role: "designer",
   },
   {
      id: "des-14",
      name: "Elena Flores",
      email: "elena.flores@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=ElenaFlores",
      role: "designer",
   },
   {
      id: "des-15",
      name: "Daniel Molina",
      email: "daniel.molina@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=DanielMolina",
      role: "designer",
   },
   {
      id: "des-16",
      name: "Patricia Navarro",
      email: "patricia.navarro@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=PatriciaNavarro",
      role: "designer",
   },
   {
      id: "des-17",
      name: "Oscar Ramírez",
      email: "oscar.ramirez@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=OscarRamirez",
      role: "designer",
   },
   {
      id: "des-18",
      name: "Carmen Ortega",
      email: "carmen.ortega@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=CarmenOrtega",
      role: "designer",
   },
   {
      id: "des-19",
      name: "Sebastián Cruz",
      email: "sebastian.cruz@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=SebastianCruz",
      role: "designer",
   },
   {
      id: "des-20",
      name: "Adriana Medina",
      email: "adriana.medina@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=AdrianaMedina",
      role: "designer",
   },
   {
      id: "des-21",
      name: "Ricardo Aguilar",
      email: "ricardo.aguilar@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=RicardoAguilar",
      role: "designer",
   },
   {
      id: "des-22",
      name: "Rosa Jiménez",
      email: "rosa.jimenez@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=RosaJimenez",
      role: "designer",
   },
   {
      id: "des-23",
      name: "Eduardo Rojas",
      email: "eduardo.rojas@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=EduardoRojas",
      role: "designer",
   },
   {
      id: "des-24",
      name: "Gabriela Vega",
      email: "gabriela.vega@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=GabrielaVega",
      role: "designer",
   },
   {
      id: "des-25",
      name: "Jorge Guzmán",
      email: "jorge.guzman@agencia.com",
      avatar: "https://api.dicebear.com/9.x/avataaars/svg?seed=JorgeGuzman",
      role: "designer",
   },
];

export const users: User[] = [...contentManagers, ...designers];

export const getContentManagers = () => users.filter((u) => u.role === "cm");
export const getDesigners = () => users.filter((u) => u.role === "designer");
