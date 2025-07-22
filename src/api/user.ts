import { client } from "./api";

export type User = {
    id: string;
    name: string;
    coins: number;
}

export const createUser = async (): Promise<User> => {
    try {
        const response = await client.post("/v0/user/create");
        return response.data.user as User;
    } catch (error) {
        console.error("Error creating user:", error);
        throw error;
    }
}

export const getUser = async (userId: string): Promise<User> => {
    try {
        const response = await client.get(`/v0/user/${userId}`);
        return response.data.user as User;
    } catch (error) {
        console.error("Error fetching user:", error);
        throw error;
    }
}