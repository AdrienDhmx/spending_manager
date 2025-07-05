import {SpendingModel} from "../models/SpendingModel";
import getNeo4JDbConnection from "./Neo4JConnection";
import * as neo4j from "neo4j-driver";
import {randomUUID} from "node:crypto";
import {AmountSpentPerTimePeriodPerCategory, TimePeriod} from "../models/SpendingStatsModels";

async function getSession() {
    const db = await getNeo4JDbConnection();
    return db.session({database: "neo4j"});
}

function formatDate(neoDate: any): Date {
    if (!neoDate) return new Date();
    if (typeof neoDate === 'string') return new Date(neoDate);
    if (neoDate.year && neoDate.month) {
        return new Date(
            neoDate.year.toNumber(),
            neoDate.month.toNumber() - 1,
            neoDate.day.toNumber(),
            neoDate.hour.toNumber(),
            neoDate.minute.toNumber(),
            neoDate.second.toNumber(),
            neoDate.nanosecond.toNumber() / 1_000_000
        );
    }
    return new Date();
}

function formatSpending(node: any): any {
    return {
        id: node.id,
        label: node.label,
        description: node.description,
        amount: typeof node.amount === 'number' ? node.amount : node.amount.toNumber(),
        date: formatDate(node.date),
        category: Array.isArray(node.category) ? node.category : [],
        userId: node.userId,
        categoryId: node.categoryId,
    };
}

function formatCategory(node: any): any {
    return {
        id: node.id
    };
}

async function ensureUserExists(userId: string): Promise<void> {
    const session = await getSession();
    try {
        await session.executeWrite(tx =>
            tx.run(
                `
          MERGE (u:User {id: $userId})
          `,
                { userId }
            )
        );
    } finally {
        await session.close();
    }
}

async function ensureCategoryExists(categoryId: string): Promise<void> {
    const session = await getSession();
    try {
        await session.executeWrite(tx =>
            tx.run(
                `
          MERGE (c:Category {id: $categoryId})
          `,
                { categoryId }
            )
        );
    } finally {
        await session.close();
    }
}

async function createSpending(spendingModel: SpendingModel): Promise<any> {
    const session = await getSession();
    try {
        await ensureUserExists(spendingModel.userId);
        await ensureCategoryExists(spendingModel.categoryId);

        const result = await session.executeWrite(tx =>
            tx.run(
                `
          MATCH (u:User {id: $userId})
          MATCH (c:Category {id: $categoryId})
          CREATE (p:Spending {
            id: $id,
            label: $label,
            description: $description,
            amount: $amount,
            date: datetime($date),
            category: $category,
            createdAt: datetime(),
            updatedAt: datetime()
          })
          CREATE (p)-[:MADE_BY]->(u)
          CREATE (p)-[:BELONGS_TO]->(c)
          RETURN p, c
          `,
                {
                    id: randomUUID(),
                    userId: spendingModel.userId,
                    categoryId: spendingModel.categoryId,
                    label: spendingModel.label,
                    description: spendingModel.description ?? '',
                    amount: spendingModel.amount,
                    date: new Date(spendingModel.date).toISOString(),
                    category: spendingModel.categoryId
                }
            )
        );

        const record = result.records[0];
        if (!record) {
            console.log("No entity found in create result : ", result);
            throw new Error('No entity found');
        }

        return {
            ...formatSpending(record.get('p').properties),
            categoryId: formatCategory(record.get('c').properties)
        };
    } catch (e) {
        console.log(e);
    }
    finally {
        await session.close();
    }
}


async function getSpendings(
    userId: string,
    categoryId?: string,
    startDate?: Date,
    endDate?: Date,
    limit = 50,
    offset = 0
){
    const session = await getSession();
    try {
        await ensureUserExists(userId);

        let query = `
        MATCH (p:Spending)-[:MADE_BY]->(u:User {id: $userId})
        MATCH (p)-[:BELONGS_TO]->(c:Category)
      `;
        const params: any = { userId, limit: neo4j.int(limit), offset: neo4j.int(offset) };

        if (categoryId) {
            query += ` WHERE c.id = $categoryId`;
            params.categoryId = categoryId;
        }
        if (startDate) {
            query += categoryId ? ' AND ' : ' WHERE ';
            query += `p.date >= datetime($startDate)`;
            params.startDate = new Date(startDate).toISOString();
        }
        if (endDate) {
            query += categoryId || startDate ? ' AND ' : ' WHERE ';
            query += `p.date <= datetime($endDate)`;
            params.endDate = new Date(endDate).toISOString();
        }

        query += `
        RETURN p, c
        ORDER BY p.date DESC
        SKIP $offset
        LIMIT $limit
      `;

        const result = await session.executeRead(tx => tx.run(query, params));

        return result.records.map(record => ({
            ...formatSpending(record.get('p').properties),
            categoryId: record.get('c').properties.id,
        } as SpendingModel));
    } catch (e) {
    console.log(e);
    return [];
    } finally {
        await session.close();
    }
}

async function updateSpending(id: string, userId: string, updateData: Partial<SpendingModel>): Promise<any> {
    const session = await getSession();
    try {
        const check = await session.executeRead(tx =>
            tx.run(
                `MATCH (p:Spending {id: $id})-[:MADE_BY]->(u:User {id: $userId}) RETURN p`,
                { id, userId }
            )
        );
        if (check.records.length === 0) return null;

        const setClauses = ['p.updatedAt = datetime()'];
        const params: any = { id, userId };

        if (updateData.description !== undefined) {
            setClauses.push('p.description = $description');
            params.description = updateData.description;
        }
        if (updateData.amount !== undefined) {
            setClauses.push('p.amount = $amount');
            params.amount = updateData.amount;
        }
        if (updateData.date !== undefined) {
            setClauses.push('p.date = datetime($date)');
            params.date = new Date(updateData.date).toISOString();
        }
        if (updateData.categoryId !== undefined) {
            setClauses.push('p.category = $category');
            params.category = updateData.categoryId;
        }

        let query = `
        MATCH (p:Spending {id: $id})-[:MADE_BY]->(u:User {id: $userId})
        MATCH (p)-[r:BELONGS_TO]->(:Category)
      `;

        if (updateData.categoryId) {
            await ensureCategoryExists(updateData.categoryId);
            query += `
          DELETE r
          WITH p
          MATCH (c:Category {id: $categoryId})
          CREATE (p)-[:BELONGS_TO]->(c)
        `;
            params.categoryId = updateData.categoryId;
        } else {
            query += `WITH p, r `;
        }

        query += `
        SET ${setClauses.join(', ')}
        WITH p
        MATCH (p)-[:BELONGS_TO]->(c:Category)
        RETURN p, c
      `;

        const result = await session.executeWrite(tx => tx.run(query, params));
        if (result.records.length === 0) return null;

        return {
            ...formatSpending(result.records[0].get('p').properties),
            category: formatCategory(result.records[0].get('c').properties)
        };
    } finally {
        await session.close();
    }
}

async function deleteSpending(id: string, userId: string): Promise<boolean> {
    const session = await getSession();
    try {
        const check = await session.executeRead(tx =>
            tx.run(
                `MATCH (p:Spending {id: $id})-[:MADE_BY]->(u:User {id: $userId}) RETURN p`,
                { id, userId }
            )
        );
        if (check.records.length === 0) return false;

        await session.executeWrite(tx =>
            tx.run(
                `MATCH (p:Spending {id: $id})-[:MADE_BY]->(u:User {id: $userId}) DETACH DELETE p`,
                { id, userId }
            )
        );

        return true;
    } finally {
        await session.close();
    }
}

async function getAmountPerCategorieStats(
    userId: string,
    startDate: Date,
    endDate: Date
) {
    const session = await getSession();
    try {
        await ensureUserExists(userId);

        const params: any = { userId };

        const conditions = [];
        if (startDate) {
            conditions.push('p.date >= datetime($startDate)');
            params.startDate = new Date(startDate).toISOString();
        }

        if (endDate) {
            conditions.push('p.date <= datetime($endDate)');
            params.endDate = new Date(endDate).toISOString();
        }

        const totalsQuery = `
              MATCH (p:Spending)-[:MADE_BY]->(u:User {id: $userId})
              WHERE ${conditions.join(" AND ")}
              RETURN 
                sum(p.amount) AS totalAmount,
                count(p) AS totalCount
            `;

        const totalsResult = await session.executeRead(tx => tx.run(totalsQuery, params));
        const totalsRecord = totalsResult.records[0];

        const totalAmount = Number(totalsRecord.get('totalAmount'));
        const totalCount = Number(totalsRecord.get('totalCount'));

        const statsByCategoryQuery = `
              MATCH (p:Spending)-[:MADE_BY]->(u:User {id: $userId})
              MATCH (p)-[:BELONGS_TO]->(c:Category)
              WHERE ${conditions.join(" AND ")}
              RETURN 
                c,
                sum(p.amount) AS categoryTotal,
                count(p) AS categoryCount
              ORDER BY categoryTotal DESC
            `;

        const statsByCategoryResult = await session.executeRead(tx => tx.run(statsByCategoryQuery, params));

        const amountPerCategory = statsByCategoryResult.records.map(record => {
            const categoryNode = record.get('c').properties;
            const categoryTotal = Number(record.get('categoryTotal') ?? 0);
            const categoryCount = Number(record.get('categoryCount') ?? 0);

            return {
                category: formatCategory(categoryNode),
                totalAmount: categoryTotal,
                count: categoryCount
            };
        });

        return {
            totalAmount,
            totalCount,
            amountPerCategory
        };
    } finally {
        await session.close();
    }
}


async function getAmountPerTimePeriodPerCategoryStats(
    userId: string,
    timePeriod: TimePeriod,
    startDate: Date,
    endDate: Date
) : Promise<AmountSpentPerTimePeriodPerCategory[]> {
    const session = await getSession();
    try {
        await ensureUserExists(userId);

        const params: any = {
            userId,
            startDate: new Date(startDate).toISOString(),
            endDate: new Date(endDate).toISOString()
        };

        let timeFormatCypher = '';
        switch (timePeriod) {
            case 'week':
                timeFormatCypher = `date({ year: s.date.year, month: s.date.month, day: s.date.day })`;
                break;
            case 'month':
                timeFormatCypher = `date({ year: s.date.year, month: s.date.month, day: s.date.day })`;
                break;
            case 'year':
                timeFormatCypher = `date({ year: s.date.month })`;
                break;
            case 'day':
                timeFormatCypher = `date(s.date)`;
                break;
            default:
                throw new Error('Invalid time period');
        }

        const query = `
            MATCH (s:Spending)-[:MADE_BY]->(u:User {id: $userId})
            MATCH (s)-[:BELONGS_TO]->(c:Category)
            WHERE s.date >= datetime($startDate) AND s.date <= datetime($endDate)
            WITH ${timeFormatCypher} AS periodDate, c, sum(s.amount) AS totalAmount
            RETURN COUNT(periodDate),
                periodDate,
                c,
                totalAmount
            ORDER BY periodDate ASC
        `;

        const result = await session.executeRead(tx => tx.run(query, params));

        const groupedByPeriod: any = {};
        result.records.forEach(record => {
            const date = record.get('periodDate');
            const category = record.get('c').properties;
            const totalAmount = Number(record.get('totalAmount') ?? 0);


            let formattedDate = date.toString();
            if (timePeriod === "week") {
                formattedDate = new Date(date).toLocaleDateString("en-GB", {
                    weekday: "long",
                });
                formattedDate = formattedDate[0].toUpperCase() + formattedDate.slice(1);
            }
            if (timePeriod === "year") {
                formattedDate = new Date(startDate.getFullYear(), parseInt(date.toString().split('-')[0]) - 1, 1).toLocaleString("en-GB", {
                    month: "long"
                });
                formattedDate = formattedDate[0].toUpperCase() + formattedDate.slice(1);
            }
            if (!groupedByPeriod[formattedDate]) {
                groupedByPeriod[formattedDate] = {
                    totalAmount: 0,
                    amountPerCategory: []
                };
            }

            groupedByPeriod[formattedDate].totalAmount += totalAmount;
            groupedByPeriod[formattedDate].amountPerCategory.push({
                category: {
                    id: category.id,
                },
                totalAmount,
            });
        });

        return Object.entries(groupedByPeriod).map(([date, stats]) => ({
            date,
            ...stats
        }));
    } catch (e) {
        console.log(e);
        return [];
    }
    finally {
        await session.close();
    }
}



const spendingRepository = {
    createSpending,
    getSpendings,
    getAmountPerCategorieStats,
    getAmountPerTimePeriodPerCategoryStats,
    updateSpending,
    deleteSpending,
}

export default spendingRepository;