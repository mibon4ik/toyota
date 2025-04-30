'use server';

import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { User } from '@/types/user';

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');
const dataDir = path.dirname(usersFilePath);


const ensureDataDirExists = async (): Promise<void> => {
  try {
    await fs.access(dataDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.mkdir(dataDir, { recursive: true });
      console.log(`Created data directory: ${dataDir}`);
    } else {
      console.error("Error accessing data directory:", error);
      throw new Error("Could not access data directory.");
    }
  }
};


async function readUsersFile(): Promise<User[]> {
  await ensureDataDirExists();
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log("users.json not found, returning empty array.");
      return [];
    }
    if (error instanceof SyntaxError) {
        console.error("Error parsing users.json:", error);

        throw new Error("User data file is corrupted.");
    }
    console.error("Error reading users file:", error);
    throw new Error("Could not read user data.");
  }
}


async function writeUsersFile(users: User[]): Promise<void> {
  await ensureDataDirExists();
  try {
      if (!Array.isArray(users)) {
        console.error("Invalid users data provided to writeUsersFile:", users);
        throw new Error("Attempted to write invalid user data.");
      }
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing users file:", error);
    throw new Error("Could not save user data.");
  }
}



async function createAdminUserObject(): Promise<User> {
    const hashedPassword = await bcrypt.hash('admin', 10);
    return {
      id: 'admin-user',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',

      phoneNumber: '0000000000',
      password: hashedPassword,
      carMake: 'N/A',
      carModel: 'N/A',
      vinCode: 'ADMINVIN000000000',
      isAdmin: true,
    };
}


async function ensureAdminUser(): Promise<void> {
    let users = await readUsersFile();
    const adminIndex = users.findIndex(u => u.username === 'admin');
    const correctHashedPassword = await bcrypt.hash('admin', 10);

    let needsUpdate = false;

    if (adminIndex > -1) {
        const adminUser = users[adminIndex];

        if (adminUser.password !== correctHashedPassword || !adminUser.isAdmin) {
             console.log("Updating admin user details...");
             adminUser.password = correctHashedPassword;
             adminUser.isAdmin = true;
             needsUpdate = true;
        }
    } else {
        console.log("Admin user not found, creating...");
        const adminUser = await createAdminUserObject();
        users.unshift(adminUser);
        needsUpdate = true;
    }

    if (needsUpdate) {
        await writeUsersFile(users);
        console.log("Admin user ensured in users.json.");
    }
}


export async function getUserByUsername(username: string): Promise<User | undefined> {
  await ensureAdminUser();
  const users = await readUsersFile();
  return users.find(user => user.username === username);
}


export async function getUserByVin(vin: string): Promise<User | undefined> {
    await ensureAdminUser();
    const users = await readUsersFile();

    return users.find(user => user.vinCode?.toUpperCase() === vin?.toUpperCase());
}


export async function createUser(newUser: Omit<User, 'id' | 'isAdmin' | 'password'> & { password?: string }): Promise<User> {
  await ensureAdminUser();
  let users = await readUsersFile();


  const usernameExists = users.some(user => user.username === newUser.username);
  if (usernameExists) {
    throw new Error('Этот логин уже зарегистрирован.');
  }
  if (newUser.email) {
    const emailExists = users.some(user => user.email && user.email === newUser.email);
    if (emailExists) {
        throw new Error('Этот адрес электронной почты уже зарегистрирован.');
    }
  }
  const vinExists = users.some(user => user.vinCode?.toUpperCase() === newUser.vinCode?.toUpperCase());
  if (vinExists) {
    throw new Error('Этот VIN-код уже зарегистрирован.');
  }
  if (!newUser.password) {
    throw new Error('Password is required.');
  }



  const hashedPassword = await bcrypt.hash(newUser.password, 10);

  const userWithId: User = {
    id: Date.now().toString(),
    username: newUser.username,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email || undefined,
    phoneNumber: newUser.phoneNumber,
    password: hashedPassword,
    carMake: newUser.carMake,
    carModel: newUser.carModel,
    vinCode: newUser.vinCode.toUpperCase(),
    isAdmin: false,
  };

  users.push(userWithId);
  await writeUsersFile(users);


  const { password, ...userWithoutPassword } = userWithId;
  return userWithoutPassword as User;
}


export async function verifyPassword(username: string, passwordInput: string): Promise<User | null> {
  console.log(`Verifying password for username: ${username}`);
  await ensureAdminUser();

  const user = await getUserByUsername(username);

  if (!user) {
    console.log(`User not found: ${username}`);
    return null;
  }
  if (!user.password) {
      console.warn(`User ${username} found, but has no password hash set.`);
      return null;
  }

  console.log(`User ${username} found. Comparing passwords...`);
  try {
    const passwordsMatch = await bcrypt.compare(passwordInput, user.password);
    console.log(`Password comparison result for ${username}: ${passwordsMatch}`);

    if (passwordsMatch) {

      const { password, ...userWithoutPassword } = user;
      console.log(`Password verification successful for ${username}.`);
      return userWithoutPassword as User;
    } else {
      console.log(`Password verification failed for ${username}.`);
      return null;
    }
  } catch (error) {
    console.error(`Error during password comparison for ${username}:`, error);
    return null;
  }
}


export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  await ensureAdminUser();
  const users = await readUsersFile();
  return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
}


(async () => {
    try {
        console.log("Ensuring admin user exists on startup...");
        await ensureAdminUser();
        console.log("Admin user check complete.");
    } catch (error) {
        console.error("FATAL: Failed to ensure admin user on startup:", error);


    }
})();
