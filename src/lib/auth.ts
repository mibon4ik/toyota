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
       const adminUser = await createAdminUserObject();
       await writeUsersFile([adminUser]);
       return [adminUser];
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
      email: 'admin@admin.com',
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
    const adminIndex = users.findIndex(u => u.username.toLowerCase() === 'admin');
    const correctHashedPassword = await bcrypt.hash('admin', 10);

    let needsUpdate = false;

    if (adminIndex > -1) {
        const adminUser = users[adminIndex];
        let passwordMatches = false;
        try {
           passwordMatches = await bcrypt.compare('admin', adminUser.password || '');
        } catch {
             passwordMatches = false; 
        }

        if (adminUser.username !== 'admin' || !passwordMatches || !adminUser.isAdmin || adminUser.email !== 'admin@admin.com' || !adminUser.password) {
             adminUser.username = 'admin'; // Ensure username is lowercase
             adminUser.password = correctHashedPassword;
             adminUser.isAdmin = true;
             adminUser.email = 'admin@admin.com';
             // Ensure other default fields are set if missing for admin
             adminUser.firstName = adminUser.firstName || 'Admin';
             adminUser.lastName = adminUser.lastName || 'User';
             adminUser.phoneNumber = adminUser.phoneNumber || '0000000000';
             adminUser.carMake = adminUser.carMake || 'N/A';
             adminUser.carModel = adminUser.carModel || 'N/A';
             adminUser.vinCode = adminUser.vinCode || 'ADMINVIN000000000';
             needsUpdate = true;
        }
    } else {
        const adminUser = await createAdminUserObject();
        users.unshift(adminUser); // Add to the beginning
        needsUpdate = true;
    }

    if (needsUpdate) {
        await writeUsersFile(users);
    }
}


export async function getUserByUsername(username: string): Promise<User | undefined> {
  await ensureAdminUser();
  const users = await readUsersFile();
  const lowercasedUsername = username.toLowerCase();
  return users.find(user => user.username.toLowerCase() === lowercasedUsername);
}


export async function getUserByVin(vin: string): Promise<User | undefined> {
    await ensureAdminUser();
    const users = await readUsersFile();

    return users.find(user => user.vinCode?.toUpperCase() === vin?.toUpperCase());
}


export async function createUser(newUser: Omit<User, 'id' | 'isAdmin' | 'password'> & { password?: string }): Promise<User> {
  await ensureAdminUser();
  let users = await readUsersFile();

  const lowercasedUsername = newUser.username.toLowerCase();
  const usernameExists = users.some(user => user.username.toLowerCase() === lowercasedUsername);
  if (usernameExists) {
    throw new Error('Этот логин уже зарегистрирован.');
  }
  if (newUser.email) {
    const lowercasedEmail = newUser.email.toLowerCase();
    const emailExists = users.some(user => user.email && user.email.toLowerCase() === lowercasedEmail);
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
    username: newUser.username, // Store as provided, but comparison is case-insensitive
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

  return userWithId;
}


export async function verifyPassword(usernameInput: string, passwordInput: string): Promise<User | null> {
  await ensureAdminUser();
  // Use case-insensitive search for username
  const user = await getUserByUsername(usernameInput);

  if (!user) {
    return null;
  }
  if (!user.password) {
    return null;
  }

  try {
    const passwordsMatch = await bcrypt.compare(passwordInput, user.password);

    if (passwordsMatch) {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User;
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error during password comparison for ${usernameInput}:`, error);
    return null;
  }
}


export async function getAllUsers(): Promise<User[]> { 
  await ensureAdminUser();
  const users = await readUsersFile();
  return users; 
}

export async function updateUser(userId: string, updatedData: Partial<Omit<User, 'id' | 'password'>>): Promise<Omit<User, 'password'>> {
  await ensureAdminUser();
  let users = await readUsersFile();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    throw new Error(`Пользователь с ID "${userId}" не найден.`);
  }

  const { id, password, ...dataToUpdate } = updatedData;

  if (dataToUpdate.username && dataToUpdate.username.toLowerCase() !== users[userIndex].username.toLowerCase()) {
      const usernameExists = users.some(u => u.username.toLowerCase() === dataToUpdate.username!.toLowerCase() && u.id !== userId);
      if (usernameExists) {
          throw new Error('Этот логин уже используется другим пользователем.');
      }
  }
   if (dataToUpdate.email && dataToUpdate.email.toLowerCase() !== (users[userIndex].email || '').toLowerCase()) {
     const emailExists = users.some(u => u.email && u.email.toLowerCase() === dataToUpdate.email!.toLowerCase() && u.id !== userId);
     if (emailExists) {
         throw new Error('Этот email уже используется другим пользователем.');
     }
   }
   if (dataToUpdate.vinCode && dataToUpdate.vinCode.toUpperCase() !== users[userIndex].vinCode.toUpperCase()) {
     const vinExists = users.some(u => u.vinCode?.toUpperCase() === dataToUpdate.vinCode?.toUpperCase() && u.id !== userId);
     if (vinExists) {
       throw new Error('Этот VIN-код уже зарегистрирован для другого пользователя.');
     }
   }


  const updatedUser = {
    ...users[userIndex],
    ...dataToUpdate,
    username: dataToUpdate.username || users[userIndex].username, // Preserve case if not changing
    vinCode: dataToUpdate.vinCode ? dataToUpdate.vinCode.toUpperCase() : users[userIndex].vinCode,
    isAdmin: dataToUpdate.isAdmin ?? users[userIndex].isAdmin,
  };

  users[userIndex] = updatedUser;
  await writeUsersFile(users);

  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}

export async function updateUserPassword(userId: string, newPasswordInput: string): Promise<void> {
  await ensureAdminUser();
  let users = await readUsersFile();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    throw new Error(`Пользователь с ID "${userId}" не найден.`);
  }

  if (!newPasswordInput || newPasswordInput.length < 8) {
     throw new Error('Новый пароль должен содержать не менее 8 символов.');
  }

  const hashedPassword = await bcrypt.hash(newPasswordInput, 10);
  users[userIndex].password = hashedPassword;

  await writeUsersFile(users);
}


(async () => {
    try {
        await ensureAdminUser();
    } catch (error) {
        console.error("FATAL: Failed to ensure admin user on startup:", error);
        // Depending on the severity, you might want to exit the process
        // process.exit(1); 
    }
})();
