export const users = [
    {
        id: "user1",
        email: "admin@admin.com",
        password: "$2a$10$sALb8czV0/YGBc9BnrY8SeF629Eu47B1H3Z3hKRRzZ6lca/QrSfsS" // bcrypt hash of "admin"
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
