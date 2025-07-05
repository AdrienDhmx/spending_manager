import redisRepository from "../repositories/redisRepository";

const maxRequestCount = parseInt(process.env.RATE_LIMIT || '10');

async function redisRateLimiter(req: any, res: any) {
    const client = await redisRepository.getRedisClient();
    const redisKey = getRateLimiterKey(req.ip);
    const currentRequestCount = parseInt(await client.get(redisKey));
    if (isNaN(currentRequestCount)) {
        await client.setEx(redisKey, 60, "0");
        return;
    }

    if (currentRequestCount > maxRequestCount) {
        res.status(419).send({
            error: "Rate limit exceeded",
            request: currentRequestCount,
            maxRequests: maxRequestCount,
        });
        return
    }
    await client.incr(redisKey);
}

const getRateLimiterKey = (ip: string) : string => {
    return `rate-limiter:${ip}`;
}

export default redisRateLimiter;