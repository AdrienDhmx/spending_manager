import getMongoDbConnection from "./MongoDBConnection";
import {UserModel} from "../models/UserModel";
import {CategoryModel} from "../models/CategoryModel";
import {Document, ObjectId, WithId} from "mongodb";

async function getCategoryCollection() {
    const db = await getMongoDbConnection();
    return db.collection("category");
}

const mapDocumentToCategory = (document: WithId<Document> | null) => {
    if (!document) {
        return undefined;
    }

    return {
        id: document._id.toString(),
        name: document.name,
        color: document.color
    } as CategoryModel
}

async function getCategoriesOfUser(userId: string) {
    const collection = await getCategoryCollection();
    const documents = await collection.find({
        userId: { $eq: userId }
    }).toArray();
    return documents.map(mapDocumentToCategory);
}

async function getCategoryById(categoryId: string) {
    const collection = await getCategoryCollection();
    return mapDocumentToCategory(await collection.findOne({
        _id: { $eq: new ObjectId(categoryId) }
    }));
}

async function getCategoriesById(categoryId: string[]) {
    const collection = await getCategoryCollection();
    const query = {
        _id: { $in: categoryId.map(id => new ObjectId(id)) }
    };
    const documents = await collection.find(query).toArray();

    return documents.map(mapDocumentToCategory);
}

async function createCategory(category: CategoryModel) {
    const collection = await getCategoryCollection();
    const result = await collection.insertOne(category);
    return result.insertedId;
}

async function updateCategory(category: CategoryModel) {
    const collection = await getCategoryCollection();
    const query = {
        _id: {$eq : new ObjectId(category.id)}
    }
    const update = {
        $set: {
            name: category.name,
            color: category.color,
        },
    };
    await collection.updateOne(query, update);
}

async function deleteCategory(categoryId: string) {
    const collection = await getCategoryCollection();
    const query = {
        _id: {$eq : new ObjectId(categoryId)}
    }
    const result = await collection.deleteOne(query);

    if (result.deletedCount === 1) {
        // TODO : delete where referenced
    }
}


const categoryRepository = {
    getCategoriesOfUser,
    getCategoryById,
    getCategoriesById,
    createCategory,
    updateCategory,
    deleteCategory,
}

export default categoryRepository;