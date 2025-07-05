import {FastifyInstance, FastifyReply, FastifyRequest} from "fastify";
import extractAuthSession from "../auth/AuthSessionExtractor";
import spendingRepository from "../repositories/SpendingRepository";
import {SpendingModel, SpendingPresenterModel} from "../models/SpendingModel";
import categoryRepository from "../repositories/CategoryRepository";
import {CategoryModel} from "../models/CategoryModel";
import redisRepository from "../repositories/redisRepository";
import authMiddleware from "../auth/middleware";
import {TimePeriod} from "../models/SpendingStatsModels";
import chromaRepository from "../repositories/ChromaRepository";

const DEFAULT_CATEGORY = {
    id: "-1",
    name: "Unknown",
    color: "#a8a7a7"
} as CategoryModel;

const TEN_MINUTES_IN_SECONDS = 600;
const REDIS_USER_SPENDING_KEY_PREFIX = "user-spendings:";

const getRedisUserSpendingKey = (
    userId: string, limit: number, offset: number,
    categoryId?: string, startDate?: Date, endDate?: Date
)=> {
    let redisCacheKey = `${REDIS_USER_SPENDING_KEY_PREFIX}${userId}`;
    if (categoryId) {
        redisCacheKey += `-${categoryId}`;
    }
    if (startDate) {
        redisCacheKey += `-${startDate.getTime()}`;
    }
    if (endDate) {
        redisCacheKey += `-${endDate.getTime()}`;
    }
    return `${redisCacheKey}-${limit}-${offset}`;
}

const getRedisUserStatsKey = (userId: string, chartType: string, timePeriod: TimePeriod, endDate?: Date) => {
    let redisCacheKey = `${REDIS_USER_SPENDING_KEY_PREFIX}${userId}:${chartType}:-${timePeriod}`;
    if (endDate) {
        redisCacheKey += `-${endDate.getTime()}`;
    }
    return redisCacheKey;
}

function registerSpendingRoutes(server: FastifyInstance) {
    server.get("/spending", {
        preHandler: [authMiddleware],
        handler: async (request, reply) => {
            const authSession = (await extractAuthSession(request))!;

            const {categoryId, startDate, endDate, limit, offset} = request.params as {categoryId?:string, startDate?: Date, endDate?: Date, limit?: number, offset?: number}
            const finalLimit = limit ?? 50;
            const finalOffset = offset ?? 0;

            const redisKey = getRedisUserSpendingKey(authSession.user.id, finalLimit, finalOffset, categoryId, startDate, endDate);

            const redisClient = await redisRepository.getRedisClient();
            const cachedResult = await redisClient.get(redisKey);
            if (cachedResult) {
                reply.code(200).send(JSON.parse(cachedResult));
                return;
            }

            const spendings = await spendingRepository.getSpendings(authSession.user.id, categoryId, startDate, endDate, finalLimit, finalOffset);
            const categoriesId = new Set(spendings.map(spending => spending.categoryId));
            const categories = await categoryRepository.getCategoriesById(Array.from(categoriesId));

            const data = spendings.map(spending => {
                return {
                    ...spending,
                    category: categories.find(c => c?.id?.toString() === spending.categoryId) ?? DEFAULT_CATEGORY
                } as SpendingPresenterModel
            });

            await redisClient.setEx(redisKey, TEN_MINUTES_IN_SECONDS, JSON.stringify(data));

            reply.code(200).send(data);
    }});

    server.post("/spending", {
        preHandler: [authMiddleware],
        handler: async (request, reply) => {
            const authSession = (await extractAuthSession(request))!;

            const spending = request.body as SpendingPresenterModel;
            spending.userId = authSession.user.id;

            const id = await spendingRepository.createSpending({...spending, categoryId: spending.category.id});
            spending.id = id.toString();
            await deleteAllUserSpendingCachedData(authSession.user.id);

            spending.category = (await categoryRepository.getCategoryById(spending.category.id))!;

            await chromaRepository.insertUserInfo(authSession.user, spending);

            reply.code(200).send(spending);
        }
    });

    server.put("/spending", {
        preHandler: [authMiddleware],
        handler: async (request, reply) => {
            const authSession = (await extractAuthSession(request))!;

            const spending = request.body as SpendingModel;
            if (authSession.user.id !== spending.userId) {
                reply.code(403).send();
                return;
            }

            await spendingRepository.updateSpending(spending.id!, authSession.user.id, spending);

            await deleteAllUserSpendingCachedData(authSession.user.id);

            reply.code(200).send(spending);
    }});

    server.delete("/spending/:id", {
        preHandler: [authMiddleware],
        handler: async (request, reply) => {
            const authSession = (await extractAuthSession(request))!;

            const { id: spendingId } = request.params as { id: string };
            const success = await spendingRepository.deleteSpending(spendingId, authSession.user.id);

            if (success) {
                await deleteAllUserSpendingCachedData(authSession.user.id);
                reply.code(200).send();
            } else {
                reply.code(404).send();
            }
    }});


    server.get("/spending/stats/pie", {
        preHandler: [authMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const authSession = (await extractAuthSession(request))!;
            let { timePeriod, endDate } = request.query as {timePeriod?: TimePeriod, endDate?: string};
            timePeriod ??= "month";
            const finalEndDate = getEndDateFromTimePeriodAndEndDate(timePeriod, endDate && new Date(endDate) || new Date());
            const startDate = getStartDateFromTimePeriodAndEndDate(timePeriod, new Date(finalEndDate));

            const redisKey = getRedisUserStatsKey(authSession.user.id, "pie", timePeriod, finalEndDate);
            const redisClient = await redisRepository.getRedisClient();
            const cachedData = await redisClient.get(redisKey);
            if (cachedData) {
                reply.code(200).send(JSON.parse(cachedData));
                return;
            }

            const result = await spendingRepository.getAmountPerCategorieStats(authSession.user.id, startDate, finalEndDate);
            const categoryIds = new Set(result.amountPerCategory.map(apc => apc.category.id));

            const categories = await categoryRepository.getCategoriesById(Array.from(categoryIds));

            result.amountPerCategory = result.amountPerCategory.map(apc => {
                return {
                    ...apc,
                    category: categories.find(c => c?.id?.toString() === apc.category.id) ?? DEFAULT_CATEGORY
                }
            });

            await redisClient.setEx(redisKey, TEN_MINUTES_IN_SECONDS, JSON.stringify(result));

            reply.code(200).send(result);
        }
    });

    server.get("/spending/stats/bars", {
        preHandler: [authMiddleware],
        handler: async (request: FastifyRequest, reply: FastifyReply) => {
            const authSession = (await extractAuthSession(request))!;
            let { timePeriod, endDate } = request.query as {timePeriod?: TimePeriod, endDate?: string};
            timePeriod ??= "month";
            const finalEndDate = getEndDateFromTimePeriodAndEndDate(timePeriod, endDate && new Date(endDate) || new Date());
            const startDate = getStartDateFromTimePeriodAndEndDate(timePeriod, new Date(finalEndDate));

            const redisKey = getRedisUserStatsKey(authSession.user.id, "bars", timePeriod, finalEndDate);
            const redisClient = await redisRepository.getRedisClient();
            const cachedData = await redisClient.get(redisKey);
            if (cachedData) {
                reply.code(200).send(JSON.parse(cachedData));
                return;
            }

            const result = await spendingRepository.getAmountPerTimePeriodPerCategoryStats(authSession.user.id, timePeriod, startDate, finalEndDate);

            const data = result.map(dateResult => {
                const dateEntry: any = {
                    ...dateResult,
                }
                dateResult.amountPerCategory.map(apc => {
                    dateEntry[apc.category.id] = apc.totalAmount
                });
                return dateEntry;
            });

            await redisClient.setEx(redisKey, TEN_MINUTES_IN_SECONDS, JSON.stringify(data));

            reply.code(200).send(data);
        }
    });
}

const deleteAllUserSpendingCachedData = async (userId: string) => {
    const redisClient = await redisRepository.getRedisClient();
    for await (const key of redisClient.scanIterator({MATCH: `${REDIS_USER_SPENDING_KEY_PREFIX}${userId}*`})) {
        await redisClient.del(key);
    }
}

const getStartDateFromTimePeriodAndEndDate = (timePeriod: TimePeriod, endDate: Date) => {
    if (timePeriod === "day") {
        return new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0);
    }
    if (timePeriod === "week") {
        return getMonday(endDate);
    }
    if (timePeriod === "month") {
        return new Date(endDate.setDate(0));
    }
    return new Date(endDate.setMonth(0, 0))
}

const getEndDateFromTimePeriodAndEndDate = (timePeriod: TimePeriod, endDate: Date) => {
    if (timePeriod === "day") {
        return new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate(), 0, 0, 0);
    }
    if (timePeriod === "week") {
        return getSunday(endDate);
    }
    if (timePeriod === "month") {
        return new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
    }
    return new Date(endDate.setMonth(11, 31))
}

function getMonday(date: Date) {
    const day = date.getDay();
    const diff = date.getDate() - day + (day == 0 ? -6 : 1);
    return new Date(date.setDate(diff));
}

function getSunday(date: Date) {
    const day = date.getDay();
    const diff = date.getDate() - day + 7;
    return new Date(date.setDate(diff));
}

export default registerSpendingRoutes;