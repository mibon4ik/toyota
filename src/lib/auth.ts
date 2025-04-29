'use server';

import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';
import type { User } from '@/types/user'; // Import the User type

const usersFilePath = path.join(process.cwd(), 'src', 'data', 'users.json');

async function readUsers(): Promise<User[]> {
  try {
    const data = await fs.readFile(usersFilePath, 'utf-8');
    // Add check for empty data which can cause JSON parse error
    if (!data) {
        console.log("users.json is empty, creating admin user.");
        return [await createAdminUser()];
    }
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log("users.json not found, creating admin user.");
      return [await createAdminUser()];
    }
    // Handle JSON parsing errors specifically
    if (error instanceof SyntaxError) {
        console.error("Error parsing users.json:", error);
        console.log("users.json is corrupted, creating admin user.");
        // Overwrite corrupted file with just the admin user
        return [await createAdminUser(true)]; // Pass flag to force overwrite
    }
    console.error("Error reading users file:", error);
    throw new Error("Could not read user data.");
  }
}

async function writeUsers(users: User[]): Promise<void> {
  try {
    // Ensure users array is not empty before writing
    if (!Array.isArray(users) || users.length === 0) {
        console.warn("Attempted to write empty user array. Ensuring admin user exists.");
        users = [await createAdminUser(true)]; // Force create admin if array is empty
    }
    await fs.writeFile(usersFilePath, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error writing users file:", error);
    throw new Error("Could not save user data.");
  }
}

// Helper function to create/update the admin user
// Added forceOverwrite flag
async function createAdminUser(forceOverwrite: boolean = false): Promise<User> {
    console.log("Ensuring admin user exists with correct password hash...");
    const hashedPassword = await bcrypt.hash('admin', 10); // Hash the password 'admin'
    // console.log("Generated hash for admin:", hashedPassword); // Optional: log hash for debugging
    const adminUser: User = {
      id: 'admin-user',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      phoneNumber: '0000000000',
      password: hashedPassword, // Use the newly generated hash
      carMake: 'AdminCar',
      carModel: 'AdminModel',
      vinCode: 'ADMINVINCODE00000',
      isAdmin: true,
    };

    let users: User[] = [];
    if (!forceOverwrite) {
        try {
            // Try reading existing users if not forcing overwrite
            const data = await fs.readFile(usersFilePath, 'utf-8');
            if (data) users = JSON.parse(data);
        } catch (error) {
            // Ignore read errors if not forcing overwrite, will create new file
             if ((error as NodeJS.ErrnoException).code !== 'ENOENT' && !(error instanceof SyntaxError)) {
                 console.error("Error reading users file during admin creation:", error);
             }
        }
    }

    // Find if admin already exists
    const adminIndex = users.findIndex(u => u.id === 'admin-user');
    if (adminIndex > -1) {
        // Update existing admin user's password hash
        users[adminIndex].password = hashedPassword;
         console.log("Admin user password hash updated.");
    } else {
        // Add admin user if not found
        users.unshift(adminUser); // Add to the beginning
         console.log("Admin user created.");
    }

    // Write the updated users array back to the file
    await writeUsers(users);
    console.log("Admin user check complete in users.json");
    // Return admin user without password for safety, although it's internal
    const { password, ...adminWithoutPassword } = adminUser;
    return adminWithoutPassword as User;
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
  let users = await readUsers(); // Read existing users

  // Ensure admin user is always present if list is somehow empty after read
  const adminExists = users.some(u => u.id === 'admin-user');
  if (!adminExists) {
      console.warn("Admin user missing after read, ensuring admin exists.");
      users = [await createAdminUser(), ...users.filter(u => u.id !== 'admin-user')]; // Ensure admin is first
  }


  const usernameExists = users.some(user => user.username === newUser.username);
  if (usernameExists) {
    throw new Error('Этот логин уже зарегистрирован.');
  }

  // Optional: Check for email uniqueness if email is provided and required to be unique
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
  console.log(`Verifying password for user: ${username}`);
  const user = await getUserByUsername(username);

  if (!user) {
    console.log(`User not found: ${username}`);
    return null;
  }
  if (!user.password) {
      console.log(`User ${username} found, but has no password set.`);
      return null; // User exists but no password is set
  }

   console.log(`User ${username} found. Comparing passwords...`);
   // console.log("Stored hash:", user.password); // Optional: log hash for debugging
   // console.log("Input password:", passwordInput); // Be careful logging passwords

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
  const users = await readUsers();
  // Exclude password from the list returned
  return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
}

// Ensure admin user exists on server startup (can be called in a global setup file if needed)
(async () => {
    await createAdminUser();
})();
