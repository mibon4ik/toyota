export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password?: string; // Password should ideally be handled server-side and hashed
  carMake: string;
  carModel: string;
  vinCode: string;
  isAdmin?: boolean; // Optional field for admin status
}
