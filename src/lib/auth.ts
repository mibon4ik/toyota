'use server';

import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import { User } from '@/types/user'; // Assuming User type definition exists

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error("Error reading users file:", error);
    throw new Error("Could not read user data.");
  }
}

async function writeUsers(users: User[]): Promise<void> {
  try {
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing users file:", error);
    throw new Error("Could not save user data.");
  }
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const users = await readUsers();
  return users.find(user => user.email === email);
}

export async function getUserByVin(vin: string): Promise<User | undefined> {
  const users = await readUsers();
  return users.find(user => user.vinCode === vin);
}

export async function createUser(newUser: Omit<User, 'id' | 'isAdmin' | 'password'> & { password?: string }): Promise<User> {
  const users = await readUsers();

  const emailExists = users.some(user => user.email === newUser.email);
  if (emailExists) {
    throw new Error('Этот адрес электронной почты уже зарегистрирован.');
  }

  const vinExists = users.some(user => user.vinCode === newUser.vinCode);
  if (vinExists) {
    throw new Error('Этот VIN-код уже зарегистрирован.');
  }

    if (!newUser.password) {
        throw new Error('Password is required.');
    }

  const hashedPassword = await bcrypt.hash(newUser.password, 10);

  const userWithId: User = {
    ...newUser,
    id: Date.now().toString(), // Simple ID generation
    password: hashedPassword,
    isAdmin: false, // Default to non-admin
  };

  users.push(userWithId);
  await writeUsers(users);

  // Omit password from returned user object for security
  const { password, ...userWithoutPassword } = userWithId;
  return userWithoutPassword as User;
}

export async function verifyPassword(email: string, passwordInput: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user || !user.password) {
    return null;
  }

  const passwordsMatch = await bcrypt.compare(passwordInput, user.password);
  if (passwordsMatch) {
       // Omit password from returned user object for security
       const { password, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
  }

  return null;
}

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  const users = await readUsers();
  // Exclude password from the list returned
  return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
}
