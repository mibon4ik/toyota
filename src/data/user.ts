
export const users = [
    {
        id: "admin",
        email: "admin@admin.com",
    }
];

export const getUserByEmail = async (email: string) => {
    try {
        return users.find((user) => user.email === email);
    } catch {
        return null;
    }
};

export const getUserById = async (id: string) => {
    try {
        return users.find((user) => user.id === id);
    } catch {
        return null;
    }
};
