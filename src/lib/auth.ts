
'use server';

import fs from 'fs/promises';
import path from 'path';
import type { User, StoredUser, UserRole } from '@/types/user';

const usersDataPath = path.join(process.cwd(), 'src', 'data', 'users.json');
const dataDirectory = path.dirname(usersDataPath);

const checkDataDirectory = async (): Promise<void> => {
  try {
    await fs.access(dataDirectory);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.mkdir(dataDirectory, { recursive: true });
    } else {
      console.error("Error accessing data directory:", error);
      throw new Error("Could not access data directory.");
    }
  }
};

async function loadUsersFromFile(): Promise<User[]> {
  await checkDataDirectory();
  try {
    const fileContent = await fs.readFile(usersDataPath, 'utf-8');
    return JSON.parse(fileContent || '[]');
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
       const defaultAdmin = createDefaultAdmin();
       await saveUsersToFile([defaultAdmin]);
       return [defaultAdmin];
    }
    if (error instanceof SyntaxError) {
        console.error("Error parsing users.json:", error);
        throw new Error("User data file is corrupted.");
    }
    console.error("Error reading users file:", error);
    throw new Error("Could not read user data.");
  }
}

async function saveUsersToFile(usersArray: User[]): Promise<void> {
  await checkDataDirectory();
  try {
      if (!Array.isArray(usersArray)) {
        console.error("Invalid users data provided to saveUsersToFile:", usersArray);
        throw new Error("Attempted to write invalid user data.");
      }
    await fs.writeFile(usersDataPath, JSON.stringify(usersArray, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing users file:", error);
    throw new Error("Could not save user data.");
  }
}

function createDefaultAdmin(): User {
    return {
      id: 'admin-user-default-id', 
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      phoneNumber: '0000000000',
      carMake: 'Toyota',
      carModel: 'Land Cruiser',
      vinCode: 'ADMINVIN000000000',
      isAdmin: true,
    };
}

async function setupDefaultAdmin(): Promise<void> {
    let currentUsers = await loadUsersFromFile();
    const adminUserIndex = currentUsers.findIndex(u => u.username.toLowerCase() === 'admin');

    let needsSave = false;

    if (adminUserIndex > -1) {
        const adminData = currentUsers[adminUserIndex];
        if (
            adminData.username !== 'admin' ||
            adminData.password !== 'admin123' ||
            adminData.role !== 'admin' ||
            adminData.isAdmin !== true ||
            adminData.email !== 'admin@example.com'
        ) {
             currentUsers[adminUserIndex] = {
                ...createDefaultAdmin(),
                id: adminData.id, 
             };
             needsSave = true;
        }
    } else {
        const newAdmin = createDefaultAdmin();
        currentUsers.unshift(newAdmin);
        needsSave = true;
    }

    if (needsSave) {
        await saveUsersToFile(currentUsers);
    }
}

export async function findUserByUsername(usernameToFind: string): Promise<User | undefined> {
  await setupDefaultAdmin();
  const allUsers = await loadUsersFromFile();
  const lowercasedUsernameToFind = usernameToFind.toLowerCase();
  return allUsers.find(user => user.username.toLowerCase() === lowercasedUsernameToFind);
}

export async function checkUserLogin(usernameProvided: string, passwordProvided: string): Promise<StoredUser | null> {
  await setupDefaultAdmin();
  const foundUser = await findUserByUsername(usernameProvided);

  if (!foundUser || !foundUser.password) {
    return null;
  }

  if (foundUser.password === passwordProvided) {
    const { password, ...userDetails } = foundUser;
    const sessionUser: StoredUser = {
      ...userDetails,
      isAdmin: foundUser.role === 'admin',
      role: foundUser.role as UserRole,
    };
    return sessionUser;
  } else {
    return null;
  }
}

export async function registerNewUser(userData: Omit<User, 'id' | 'role' | 'isAdmin'> & { password?: string }): Promise<User> {
  await setupDefaultAdmin();
  let allUsers = await loadUsersFromFile();

  const usernameLower = userData.username.toLowerCase();
  if (allUsers.some(user => user.username.toLowerCase() === usernameLower)) {
    throw new Error('Этот логин уже зарегистрирован.');
  }
  if (userData.email) {
    const emailLower = userData.email.toLowerCase();
    if (allUsers.some(user => user.email && user.email.toLowerCase() === emailLower)) {
        throw new Error('Этот адрес электронной почты уже зарегистрирован.');
    }
  }
  if (allUsers.some(user => user.vinCode?.toUpperCase() === userData.vinCode?.toUpperCase())) {
    throw new Error('Этот VIN-код уже зарегистрирован.');
  }
  if (!userData.password) {
    throw new Error('Password is required.');
  }

  const newUserRecord: User = {
    id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    username: userData.username,
    firstName: userData.firstName,
    lastName: userData.lastName,
    email: userData.email || undefined,
    phoneNumber: userData.phoneNumber,
    password: userData.password,
    carMake: userData.carMake,
    carModel: userData.carModel,
    vinCode: userData.vinCode.toUpperCase(),
    role: 'user',
    isAdmin: false,
  };

  allUsers.push(newUserRecord);
  await saveUsersToFile(allUsers);

  return newUserRecord;
}

export async function fetchAllUsers(): Promise<User[]> {
  await setupDefaultAdmin();
  const usersList = await loadUsersFromFile();
  return usersList.map(user => ({...user, isAdmin: user.role === 'admin'}));
}

export async function modifyUser(userIdToUpdate: string, dataForUpdate: Partial<Omit<User, 'id' | 'password'>>): Promise<StoredUser> {
  await setupDefaultAdmin();
  let currentUsers = await loadUsersFromFile();
  const userIdx = currentUsers.findIndex(u => u.id === userIdToUpdate);

  if (userIdx === -1) {
    throw new Error(`Пользователь с ID "${userIdToUpdate}" не найден.`);
  }

  const { id, password, role, isAdmin, ...updateFields } = dataForUpdate;

  if (updateFields.username && updateFields.username.toLowerCase() !== currentUsers[userIdx].username.toLowerCase()) {
      if (currentUsers.some(u => u.username.toLowerCase() === updateFields.username!.toLowerCase() && u.id !== userIdToUpdate)) {
          throw new Error('Этот логин уже используется другим пользователем.');
      }
  }
   if (updateFields.email && currentUsers[userIdx].email && updateFields.email.toLowerCase() !== (currentUsers[userIdx].email || '').toLowerCase()) {
     if (currentUsers.some(u => u.email && u.email.toLowerCase() === updateFields.email!.toLowerCase() && u.id !== userIdToUpdate)) {
         throw new Error('Этот email уже используется другим пользователем.');
     }
   }
   if (updateFields.vinCode && updateFields.vinCode.toUpperCase() !== currentUsers[userIdx].vinCode.toUpperCase()) {
     if (currentUsers.some(u => u.vinCode?.toUpperCase() === updateFields.vinCode?.toUpperCase() && u.id !== userIdToUpdate)) {
       throw new Error('Этот VIN-код уже зарегистрирован для другого пользователя.');
     }
   }

  const modifiedUser: User = {
    ...currentUsers[userIdx],
    ...updateFields,
    username: updateFields.username || currentUsers[userIdx].username,
    vinCode: updateFields.vinCode ? updateFields.vinCode.toUpperCase() : currentUsers[userIdx].vinCode,
    role: dataForUpdate.role ? dataForUpdate.role as UserRole : currentUsers[userIdx].role,
    isAdmin: dataForUpdate.role ? dataForUpdate.role === 'admin' : currentUsers[userIdx].isAdmin,
  };

  currentUsers[userIdx] = modifiedUser;
  await saveUsersToFile(currentUsers);

  const { password: _p, ...userToReturn } = modifiedUser;
  return userToReturn as StoredUser;
}

export async function changeUserPassword(userIdToChange: string, newPasswordValue: string): Promise<void> {
  await setupDefaultAdmin();
  let usersArray = await loadUsersFromFile();
  const userRecordIndex = usersArray.findIndex(u => u.id === userIdToChange);

  if (userRecordIndex === -1) {
    throw new Error(`Пользователь с ID "${userIdToChange}" не найден.`);
  }

  if (!newPasswordValue || newPasswordValue.length < 8) {
     throw new Error('Новый пароль должен содержать не менее 8 символов.');
  }

  usersArray[userRecordIndex].password = newPasswordValue;

  await saveUsersToFile(usersArray);
}

(async () => {
    try {
        await setupDefaultAdmin();
    } catch (error) {
        console.error("FATAL: Failed to ensure admin user on startup:", error);
    }
})();
