'use server';

import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { User } from '@/types/user'; // Import the User type

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // Initialize with admin user if file doesn't exist
       const adminUser = await createAdminUser();
       return [adminUser];
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

// Helper function to create the initial admin user
async function createAdminUser(): Promise<User> {
    const hashedPassword = await bcrypt.hash('admin', 10); // Hash the password 'admin'
    const adminUser: User = {
      id: 'admin-user',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com', // Keep email optional or use a placeholder
      phoneNumber: '0000000000',
      password: hashedPassword,
      carMake: 'AdminCar',
      carModel: 'AdminModel',
      vinCode: 'ADMINVINCODE00000',
      isAdmin: true,
    };
    await writeUsers([adminUser]); // Write the admin user to the file
    return adminUser;
}


export async function getUserByUsername(username: string): Promise<User | undefined> {
  const users = await readUsers();
  return users.find(user => user.username === username);
}


export async function getUserByVin(vin: string): Promise<User | undefined> {
  const users = await readUsers();
  return users.find(user => user.vinCode === vin);
}

export async function createUser(newUser: Omit<User, 'id' | 'isAdmin' | 'password'> & { password?: string }): Promise<User> {
  const users = await readUsers();

  const usernameExists = users.some(user => user.username === newUser.username);
  if (usernameExists) {
    throw new Error('Этот логин уже зарегистрирован.');
  }

  // Optional: Check for email uniqueness if email is provided and required to be unique
  if (newUser.email) {
      const emailExists = users.some(user => user.email === newUser.email);
      if (emailExists) {
          throw new Error('Этот адрес электронной почты уже зарегистрирован.');
      }
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

export async function verifyPassword(username: string, passwordInput: string): Promise<User | null> {
  const user = await getUserByUsername(username);
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
