export interface User {
  id: string;
  username: string; // Added username field
  firstName: string;
  lastName: string;
  email?: string; // Make email optional
  phoneNumber: string;
  password?: string; // Password should ideally be handled server-side and hashed
  carMake: string;
  carModel: string;
  vinCode: string;
  isAdmin?: boolean; // Optional field for admin status
}
