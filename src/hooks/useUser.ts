import { useCallback, useEffect } from "react";
import { createUser, getUser, type User } from "../api/user";
import { useStorage } from "./useStorage";

const AWAIING_USER_ID = "AWAITING_ID";
const USER_KEY = "user";

const EMPTY_USER: User = {
    id: AWAIING_USER_ID,
    name: "",
    coins: 0,
};

export const useUser = () => {
    const [user, setUser] = useStorage<User>(USER_KEY, EMPTY_USER);

    const refetchUser = useCallback(async () => {
        if(user !== null && user.id !== AWAIING_USER_ID) {
            getUser(user.id).then(setUser)
        }
    }, [user?.id]);

    useEffect(() => {
        console.log("CALLED:", user);
        if(user === null) {
            createUser().then(setUser);
        }
    }, [user]);

    useEffect(() => {
        refetchUser();
    }, []);

    return { user, refetchUser };
}