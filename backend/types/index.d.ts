type Game = {
  id: number;
  opponents: [User, User];
};

type User = {
  id: number;
  name: string;
  email: string;
  games: Game[];
};

const users: User[] = [
  {
    id: 1,
    name: 'John Doe',
    email: '',
  },
];

export type AuthRequest = {
  email: string;
  password: number;
  username: string;
};

export type AuthResponse = {
  status: number;
  headers: Header;
  body: Body;
};
