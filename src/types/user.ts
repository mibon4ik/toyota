
export type UserAccountRole = 'admin' | 'user';

export interface UserAccount {
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

export type UserSessionData = Omit<UserAccount, 'password'>;
