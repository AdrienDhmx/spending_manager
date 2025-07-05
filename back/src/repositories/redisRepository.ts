import {createClient} from "redis";
import {UserModel} from "../models/UserModel";

let client: any | null = null;

const getClient = async () => {
    if (!client) {
        client = await createClient({
            url: process.env.REDIS_URL
        })
            .on("error", (err) => console.log("Redis Client Error", err))
            .connect();
    }

    return client;
}

const getUserTokenKey = (token: string):string => {
    return `auth:${token}`;
}

const getUserWithToken = async (token: string)  => {
    const redis = await getClient();
    const user = await redis.get(getUserTokenKey(token));

    if (!user) {
        return null;
    }

    return JSON.parse(user);
}

const setUserWithToken = async (token: string, user: UserModel)  => {
    const redis = await getClient();
    await redis.setEx(getUserTokenKey(token), 1000 * 60 * 60 * 24 * 7, JSON.stringify(user));
}

const deleteUserWithToken = async (token: string) => {
    const redis = await getClient();
    await redis.del(getUserTokenKey(token));
}

const redisRepository = {
    getRedisClient: getClient,
    getUserWithToken,
    setUserWithToken,
    removeUserWithToken: deleteUserWithToken
}

export default redisRepository;