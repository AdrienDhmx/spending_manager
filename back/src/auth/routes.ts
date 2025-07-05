import {FastifyInstance, FastifyReply} from "fastify";
import redisRepository from "../repositories/redisRepository";
import {UserModel} from "../models/UserModel";
import {randomUUID} from "node:crypto";
import userRepository from "../repositories/UserRepository";
import redisRateLimiter from "../rateLimiter/middleware";

export default function registerAuthRoutes(server: FastifyInstance) {
    server.post('/auth/login', {
        preHandler: [redisRateLimiter],
        handler: async (request, reply) => {
            const { email, password } = request.body as {email: string, password: string};

            const user = await userRepository.getUserByEmail(email);

            if (!user || user.password !== password) {
                reply.code(401).send("Incorrect credentials");
                return;
            }

            user.password = undefined;
            const token = randomUUID();
            await redisRepository.setUserWithToken(token, user);

            setTokenInCookie(reply, token).code(200).send(user);
        }
    });

    server.delete("/auth/logout", {
        preHandler: [redisRateLimiter],
        handler: async (request, reply) => {
            const token = request.cookies.token;
            if(!token) {
                reply.code(401).send();
                return;
            }

            await redisRepository.removeUserWithToken(token);

            reply.code(200).send();
        }
    });

    server.post("/auth/signup", {
        preHandler: [redisRateLimiter],
        handler: async (request, reply) => {
            const user = request.body as UserModel;
            const token = randomUUID();

            const id =  await userRepository.createUser(user);
            user.id = id.toHexString();
            user.password = undefined;
            await redisRepository.setUserWithToken(token, user);

            reply.code(200).send();
        }
    })

    server.get("/auth/me", {
        preHandler: [redisRateLimiter],
        handler: async (request, reply) => {
            const token = request.cookies.token;
            if(!token) {
                reply.code(401).send("No token");
                return;
            }

            const user = await redisRepository.getUserWithToken(token);
            if (!user) {
                reply.code(401).send("Your token has expired")
                return;
            }

            setTokenInCookie(reply, token).code(200).send(user);
        }
    })
}

const setTokenInCookie = (reply: FastifyReply, token: string) => {
    return reply.setCookie('token', token, {
        httpOnly: true,
        path: '/',
        secure: true,
        sameSite: 'lax'
    });
}
