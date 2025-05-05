'use server';

import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { User } from '@/types/user';
import type { CookieSerializeOptions } from 'cookie'; // Import CookieSerializeOptions type

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
       // If file doesn't exist, initialize with admin user
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
    const adminIndex = users.findIndex(u => u.username === 'admin');
    const correctHashedPassword = await bcrypt.hash('admin', 10);

    let needsUpdate = false;

    if (adminIndex > -1) {
        const adminUser = users[adminIndex];
        let passwordMatches = false;
        try {
           // Check if current stored password is correct
           passwordMatches = await bcrypt.compare('admin', adminUser.password || '');
        } catch {
             passwordMatches = false; // Assume password needs update if hash is invalid
        }

        if (!passwordMatches || !adminUser.isAdmin || adminUser.email !== 'admin@admin.com' || !adminUser.password) {
             // Update password hash, ensure isAdmin is true, and email is correct
             adminUser.password = correctHashedPassword;
             adminUser.isAdmin = true;
             adminUser.email = 'admin@admin.com';
             needsUpdate = true;
        }
    } else {
        // Add admin user if not found
        const adminUser = await createAdminUserObject();
        users.unshift(adminUser);
        needsUpdate = true;
    }

    if (needsUpdate) {
        await writeUsersFile(users);
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


  // Return the user object *including* the password hash for admin view
  return userWithId;
}


export async function verifyPassword(username: string, passwordInput: string): Promise<User | null> {
  await ensureAdminUser();

  const user = await getUserByUsername(username);

  if (!user) {
      console.log(`verifyPassword: User not found for username: ${username}`);
    return null;
  }
  if (!user.password) {
       console.log(`verifyPassword: User ${username} has no password hash set.`);
      return null;
  }

  try {
      console.log(`verifyPassword: Comparing password for ${username}`);
    const passwordsMatch = await bcrypt.compare(passwordInput, user.password);

    if (passwordsMatch) {
        console.log(`verifyPassword: Password match for ${username}.`);
      // Return user data WITHOUT password hash for session/client-side use
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword as User; // Ensure correct type casting
    } else {
       console.log(`verifyPassword: Password mismatch for ${username}.`);
      return null;
    }
  } catch (error) {
    console.error(`Error during password comparison for ${username}:`, error);
    return null;
  }
}


export async function getAllUsers(): Promise<User[]> { // Return full User objects
  await ensureAdminUser();
  const users = await readUsersFile();
  return users; // Return the full user objects including password hash
}

// Function to update user details (excluding password)
export async function updateUser(userId: string, updatedData: Partial<Omit<User, 'id' | 'password'>>): Promise<Omit<User, 'password'>> {
  await ensureAdminUser();
  let users = await readUsersFile();
  const userIndex = users.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    throw new Error(`Пользователь с ID "${userId}" не найден.`);
  }

  // Prevent updating ID or password with this function
  const { id, password, ...dataToUpdate } = updatedData;

  // Ensure username uniqueness if changed
  if (dataToUpdate.username && dataToUpdate.username !== users[userIndex].username) {
      const usernameExists = users.some(u => u.username === dataToUpdate.username && u.id !== userId);
      if (usernameExists) {
          throw new Error('Этот логин уже используется другим пользователем.');
      }
  }
   // Ensure email uniqueness if changed and provided
   if (dataToUpdate.email && dataToUpdate.email !== users[userIndex].email) {
     const emailExists = users.some(u => u.email && u.email === dataToUpdate.email && u.id !== userId);
     if (emailExists) {
         throw new Error('Этот email уже используется другим пользователем.');
     }
   }
   // Ensure VIN uniqueness if changed
   if (dataToUpdate.vinCode && dataToUpdate.vinCode.toUpperCase() !== users[userIndex].vinCode.toUpperCase()) {
     const vinExists = users.some(u => u.vinCode?.toUpperCase() === dataToUpdate.vinCode?.toUpperCase() && u.id !== userId);
     if (vinExists) {
       throw new Error('Этот VIN-код уже зарегистрирован для другого пользователя.');
     }
   }


  const updatedUser = {
    ...users[userIndex],
    ...dataToUpdate,
    vinCode: dataToUpdate.vinCode ? dataToUpdate.vinCode.toUpperCase() : users[userIndex].vinCode,
    isAdmin: dataToUpdate.isAdmin ?? users[userIndex].isAdmin,
  };

  users[userIndex] = updatedUser;
  await writeUsersFile(users);

  const { password: _, ...userWithoutPassword } = updatedUser;
  return userWithoutPassword;
}

// Function to update only the user's password
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
    }
})();