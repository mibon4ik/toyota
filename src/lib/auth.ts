'use server';

import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { User } from '@/types/user';

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');
const dataDir = path.dirname(usersFilePath);

// --- File System Operations ---

/** Ensures the data directory exists. */
const ensureDataDirExists = async (): Promise<void> => {
  try {
    await fs.access(dataDir);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      await fs.mkdir(dataDir, { recursive: true });
      console.log(`Created data directory: ${dataDir}`);
    } else {
      console.error("Error accessing data directory:", error);
      throw new Error("Could not access data directory."); // Throw a more specific error
    }
  }
};

/** Reads user data from the JSON file. */
async function readUsersFile(): Promise<User[]> {
  await ensureDataDirExists();
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    return JSON.parse(data || '[]'); // Return empty array if file is empty
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log("users.json not found, returning empty array.");
      return []; // File doesn't exist, return empty array
    }
    if (error instanceof SyntaxError) {
        console.error("Error parsing users.json:", error);
        // Decide how to handle corrupted file (e.g., backup and recreate, or throw)
        throw new Error("User data file is corrupted.");
    }
    console.error("Error reading users file:", error);
    throw new Error("Could not read user data.");
  }
}

/** Writes user data to the JSON file. */
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

// --- User Management Logic ---

/** Creates the admin user object with a hashed password. */
async function createAdminUserObject(): Promise<User> {
    const hashedPassword = await bcrypt.hash('admin', 10); // Use default admin password
    return {
      id: 'admin-user',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      // email: 'admin@example.com', // Optional
      phoneNumber: '0000000000', // Placeholder
      password: hashedPassword,
      carMake: 'N/A', // Placeholder
      carModel: 'N/A', // Placeholder
      vinCode: 'ADMINVIN000000000', // Placeholder
      isAdmin: true,
    };
}

/** Ensures the admin user exists and has the correct credentials. */
async function ensureAdminUser(): Promise<void> {
    let users = await readUsersFile();
    const adminIndex = users.findIndex(u => u.username === 'admin');
    const correctHashedPassword = await bcrypt.hash('admin', 10);

    let needsUpdate = false;

    if (adminIndex > -1) {
        const adminUser = users[adminIndex];
        // Check if password needs updating or isAdmin flag is missing/false
        if (adminUser.password !== correctHashedPassword || !adminUser.isAdmin) {
             console.log("Updating admin user details...");
             adminUser.password = correctHashedPassword;
             adminUser.isAdmin = true;
             needsUpdate = true;
        }
    } else {
        console.log("Admin user not found, creating...");
        const adminUser = await createAdminUserObject();
        users.unshift(adminUser); // Add to the beginning
        needsUpdate = true;
    }

    if (needsUpdate) {
        await writeUsersFile(users);
        console.log("Admin user ensured in users.json.");
    }
}

/** Finds a user by their username. */
export async function getUserByUsername(username: string): Promise<User | undefined> {
  await ensureAdminUser(); // Make sure admin exists before any user lookup
  const users = await readUsersFile();
  return users.find(user => user.username === username);
}

/** Finds a user by their VIN code. */
export async function getUserByVin(vin: string): Promise<User | undefined> {
    await ensureAdminUser();
    const users = await readUsersFile();
    // Ensure case-insensitive comparison for VIN
    return users.find(user => user.vinCode?.toUpperCase() === vin?.toUpperCase());
}

/** Creates a new user. */
export async function createUser(newUser: Omit<User, 'id' | 'isAdmin' | 'password'> & { password?: string }): Promise<User> {
  await ensureAdminUser(); // Ensure admin exists before creating users
  let users = await readUsersFile();

  // --- Validation ---
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
   // --- End Validation ---

  const hashedPassword = await bcrypt.hash(newUser.password, 10);

  const userWithId: User = {
    id: Date.now().toString(), // Simple unique ID
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
  await writeUsersFile(users);

  // Omit password from returned user object for security
  const { password, ...userWithoutPassword } = userWithId;
  return userWithoutPassword as User;
}

/** Verifies a user's password. */
export async function verifyPassword(username: string, passwordInput: string): Promise<User | null> {
  console.log(`Verifying password for username: ${username}`);
  await ensureAdminUser(); // Ensure admin exists

  const user = await getUserByUsername(username);

  if (!user) {
    console.log(`User not found: ${username}`);
    return null;
  }
  if (!user.password) {
      console.warn(`User ${username} found, but has no password hash set.`);
      return null; // Cannot verify if no password hash exists
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
    return null; // Return null on comparison error
  }
}

/** Retrieves all users, omitting passwords. */
export async function getAllUsers(): Promise<Omit<User, 'password'>[]> {
  await ensureAdminUser(); // Ensure admin user data is up-to-date
  const users = await readUsersFile();
  return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
}

// --- Initialization ---
// Ensure admin user exists when the server starts.
(async () => {
    try {
        console.log("Ensuring admin user exists on startup...");
        await ensureAdminUser();
        console.log("Admin user check complete.");
    } catch (error) {
        console.error("FATAL: Failed to ensure admin user on startup:", error);
        // Consider exiting the process if admin setup fails critically
        // process.exit(1);
    }
})();
