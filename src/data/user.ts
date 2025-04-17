export const users = [
    {
        id: "user1",
        email: "test@test.com",
        password: "$2a$10$CwZZhLTqEwV9uFqFk60mMeo42ZgVf.Xh.B4K2RyJ1rGmRuKwyJ.a6"
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
    