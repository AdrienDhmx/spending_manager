import getMongoDbConnection from "./MongoDBConnection";
import {UserModel} from "../models/UserModel";

async function getUserCollection() {
    const db = await getMongoDbConnection();
    return db.collection("user");
}

async function getUserByEmail(email: string) {
    const collection = await getUserCollection();
    const user = (await collection.findOne({
        email: { $eq: email }
    }));

    if (user) {
        return {
            ...user,
            id: user._id.toString(),
        } as unknown as UserModel
    }
    return undefined;
}

async function createUser(user: UserModel) {
    const collection = await getUserCollection();
    const result = await collection.insertOne(user);
    return result.insertedId;
}


const userRepository = {
    getUserByEmail,
    createUser,
}

export default userRepository;