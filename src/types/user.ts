
export type UserAccountRole = 'admin' | 'user';

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
  role: UserAccountRole; 
  isAdmin: boolean;     
}

export interface StoredUser {
  id: string;
  username: string;
  role: UserAccountRole; 
  isAdmin: boolean;
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  carMake: string;
  carModel: string;
  vinCode: string;
}
