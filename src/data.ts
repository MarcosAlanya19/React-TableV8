export interface DataTest {
  id: number;
  attributes: Data;
}

interface Data {
  name: string;
  country: string;
  dni: number;
  registrationDate: string;
  status: string;
  actions: String;
}

export const dataTesting: DataTest[] = [
  {
    id: 1,
    attributes: {
      name: "Marcos Alanya",
      country: "Perú",
      dni: 74845954,
      registrationDate: "12/02/2021",
      status: "Activo",
      actions: 'Ver Perfil',
    },
  },
  {
    id: 2,
    attributes: {
      name: "Jorge Luis",
      country: "Perú",
      dni: 10801624,
      registrationDate: "12/02/2021",
      status: "hola",
      actions: 'Ver Perfil',
    },
  },
  {
    id: 3,
    attributes: {
      name: "Maximo Apaza",
      country: "Perú",
      dni: 10101010,
      registrationDate: "12/02/2021",
      status: "incativo",
      actions: 'Ver Perfil',
    },
  },
];
