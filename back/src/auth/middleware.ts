import extractAuthSession from "./AuthSessionExtractor";
import {FastifyReply, FastifyRequest} from "fastify";


async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
    const authSession = await extractAuthSession(request);
    if (!authSession) {
        reply.code(401).send();
        return;
    }
}

export default authMiddleware;