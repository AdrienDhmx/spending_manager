import * as neo4j from 'neo4j-driver'

let db: neo4j.Driver | undefined;

const getNeo4JDbConnection = async () => {
    if (!db) {
        const auth = neo4j.auth.basic(process.env.NEO4J_USER!, process.env.NEO4J_PASSWORD!);
        db = neo4j.driver(process.env.NEO4J_URL!, auth);
        const info = await db.getServerInfo();
        console.log('Connected to Neo4J : ', info);
    }
    return db;
}

export default getNeo4JDbConnection;