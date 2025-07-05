import * as mongoDB from "mongodb";

let db : mongoDB.Db | null = null;

async function connectToDatabase () {
    const uri = process.env.MONGODB_URL!;

    const client = new mongoDB.MongoClient(uri, {
        serverApi: {
            version: mongoDB.ServerApiVersion.v1,
            strict: false,
            deprecationErrors: true,
        }
    });

    await client.connect();

    db = client.db(process.env.MONGODB_DB_NAME);

    console.log(`Successfully connected to database: ${db.databaseName}`);
    return db
}

async function getMongoDbConnection() {
    if (!db) {
        return connectToDatabase();
    }
    return db!;
}

export default getMongoDbConnection;