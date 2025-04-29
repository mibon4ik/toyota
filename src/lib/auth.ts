'use server';

import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { User } from '@/types/user'; // Import the User type

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

// Ensure the data directory exists
const dataDir = path.dirname(usersFilePath);
const ensureDataDirExists = async () => {
  try {
    await fs.access(dataDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.mkdir(dataDir, { recursive: true });
      console.log(`Created data directory: ${dataDir}`);
    } else {
      throw error; // Re-throw other errors
    }
  }
};

async function readUsers(): Promise<User[]> {
  await ensureDataDirExists(); // Make sure directory exists before reading/writing
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    if (!data.trim()) {
      console.log("users.json is empty or only contains whitespace, initializing with admin user.");
      return [await initializeAdminUser()];
    }
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log("users.json not found, creating file with admin user.");
      return [await initializeAdminUser()];
    }
    if (error instanceof SyntaxError) {
      console.error("Error parsing users.json:", error);
      console.log("users.json might be corrupted, initializing with admin user.");
      return [await initializeAdminUser(true)]; // Force overwrite if corrupted
    }
    console.error("Error reading users file:", error);
    throw new Error("Could not read user data.");
  }
}

async function writeUsers(users: User[]): Promise<void> {
  await ensureDataDirExists(); // Make sure directory exists before writing
  try {
    if (!Array.isArray(users)) {
        console.error("Invalid users data provided to writeUsers:", users);
        throw new Error("Attempted to write invalid user data.");
    }
    // Ensure admin always exists before writing
    const adminExists = users.some(u => u.username === 'admin');
    if (!adminExists) {
        console.warn("Admin user missing from users array before writing. Adding admin...");
        const adminUser = await createAdminUserObject(); // Get admin user object
        users.unshift(adminUser); // Add admin to the beginning if missing
    }

    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing users file:", error);
    throw new Error("Could not save user data.");
  }
}

// Helper to create the admin user object with hashed password
async function createAdminUserObject(): Promise<User> {
    const hashedPassword = await bcrypt.hash('admin', 10);
    return {
      id: 'admin-user',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      // email: 'admin@example.com', // Email is optional
      phoneNumber: '0000000000',
      password: hashedPassword,
      carMake: 'AdminCar',
      carModel: 'AdminModel',
      vinCode: 'ADMINVINCODE00000',
      isAdmin: true,
    };
}


// Initialize users.json with the admin user, optionally overwriting
async function initializeAdminUser(forceOverwrite: boolean = false): Promise<User> {
    console.log("Initializing users.json with admin user...");
    const adminUser = await createAdminUserObject();
    await writeUsers([adminUser]); // Write only admin user
    console.log("users.json initialized successfully.");
    const { password, ...adminWithoutPassword } = adminUser;
    return adminWithoutPassword as User;
}

// Function to ensure the admin user exists and has the correct hashed password
async function ensureAdminUser(): Promise<void> {
    let users = await readUsers(); // Read potentially existing users
    const adminIndex = users.findIndex(u => u.username === 'admin');
    const correctHashedPassword = await bcrypt.hash('admin', 10);

    let updated = false;
    if (adminIndex > -1) {
        // Admin exists, check if password needs update
        if (users[adminIndex].password !== correctHashedPassword) {
             // Only log if password changes, avoid logging hash directly
             console.log("Admin user found, updating password hash...");
             users[adminIndex].password = correctHashedPassword;
             updated = true;
        } else {
            // console.log("Admin user found with correct password hash."); // Can be verbose
        }
        // Ensure isAdmin is true
        if (!users[adminIndex].isAdmin) {
            users[adminIndex].isAdmin = true;
            updated = true;
            console.log("Set admin user isAdmin flag to true.");
        }
    } else {
        // Admin doesn't exist, add them
        console.log("Admin user not found, creating...");
        const adminUser = await createAdminUserObject();
        users.unshift(adminUser); // Add to the beginning
        updated = true;
    }

    if (updated) {
        await writeUsers(users);
        console.log("Admin user ensured in users.json.");
    }
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
  let users = await readUsers();

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


  const vinExists = users.some(user => user.vinCode === newUser.vinCode);
  if (vinExists) {
    throw new Error('Этот VIN-код уже зарегистрирован.');
  }

  if (!newUser.password) {
    throw new Error('Password is required.');
  }

  const hashedPassword = await bcrypt.hash(newUser.password, 10);

  const userWithId: User = {
    id: Date.now().toString(), // Simple ID generation
    username: newUser.username,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    email: newUser.email || undefined,
    phoneNumber: newUser.phoneNumber,
    password: hashedPassword,
    carMake: newUser.carMake,
    carModel: newUser.carModel,
    vinCode: newUser.vinCode.toUpperCase(),
    isAdmin: false, // Default to non-admin
  };

  users.push(userWithId);
  await writeUsers(users);

  // Omit password from returned user object for security
  const { password, ...userWithoutPassword } = userWithId;
  return userWithoutPassword as User;
}

export async function verifyPassword(username: string, passwordInput: string): Promise<User | null> {
  console.log(`Verifying password for user: ${username}`);
  await ensureAdminUser(); // Ensure admin exists before verification attempt
  const user = await getUserByUsername(username);

  if (!user) {
    console.log(`User not found: ${username}`);
    return null;
  }
  if (!user.password) {
      console.log(`User ${username} found, but has no password hash set.`);
      return null; // Should not happen if users are created correctly
  }

  console.log(`User ${username} found. Comparing passwords...`);

  try {
      const passwordsMatch = await bcrypt.compare(passwordInput, user.password);
      console.log(`Password comparison result for ${username}: ${passwordsMatch}`);

      if (passwordsMatch) {
        // Omit password from returned user object for security
        const { password, ...userWithoutPassword } = user;
        console.log(`Password verification successful for ${username}.`);
        return userWithoutPassword as User;
      } else {
          console.log(`Password verification failed for ${username}.`);
        return null;
      }
   } catch (error) {
        console.error(`Error during password comparison for ${username}:`, error);
        return null; // Return null if comparison fails due to error
   }
}

export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  await ensureAdminUser(); // Ensure admin is present when fetching all users
  const users = await readUsers();
  // Exclude password from the list returned
  return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
}

// Initialize/Ensure admin user exists on server startup
(async () => {
    try {
        await ensureAdminUser();
    } catch (error) {
        console.error("Failed to ensure admin user on startup:", error);
        // Decide how to handle this critical error, maybe exit?
    }
})();