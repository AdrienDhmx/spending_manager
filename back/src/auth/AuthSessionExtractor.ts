import {FastifyRequest} from "fastify";
import redisRepository from "../repositories/redisRepository";


async function extractAuthSession(request: FastifyRequest) {
    const token = request.cookies.token;
    if (!token) {
        return null;
    }

    const user = await redisRepository.getUserWithToken(token);

    return {
        token,
        user
    }
}

export default extractAuthSession;