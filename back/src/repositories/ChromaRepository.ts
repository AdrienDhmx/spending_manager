import {CloudClient} from "chromadb";
import {UserModel} from "../models/UserModel";
import {SpendingModel, SpendingPresenterModel} from "../models/SpendingModel";


let client: CloudClient | undefined;

const getChromadDbConnection = async () => {
    if (!client) {
        client = new CloudClient({
            apiKey: process.env.CHROMA_API_KEY,
            tenant: process.env.CHROMA_TENANT,
            database: process.env.CHROMA_DATABASE
        });
    }
    return client;
}

const getUserInfoCollection = async () => {
    const client = await getChromadDbConnection();
    return await client.getOrCreateCollection({
        name: 'user_info',
    });
}

const insertUserInfo = async (user: UserModel, spending: SpendingPresenterModel) => {
    const document = buildUserInfoSentence(user, spending);
    console.log(document);
    const collection = await getUserInfoCollection();
    console.log(collection);
    await collection.add({
        ids: [spending.id!],
        documents: [document],
        metadatas: [{userId: user.id!, category: spending.category.id}]
    });
}

const buildUserInfoSentence = (user: UserModel, spending: SpendingPresenterModel): string =>  {
    let sentence = `${user.firstname} has bought ${spending.label} (${spending.category.name}) for ${spending.amount} the ${new Date(spending.date).toDateString()}`;
    if (spending.description) {
        sentence += ` : ${spending.description}`
    }
    return sentence;
}


const chromaRepository = {
    insertUserInfo,
}

export default chromaRepository;