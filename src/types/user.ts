export interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  password?: string; 
  carMake: string;
  carModel: string;
  vinCode: string;
  isAdmin?: boolean;
}

export type StoredUser = Omit<User, 'password'> & { isAdmin: boolean };
