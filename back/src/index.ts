import fastify from 'fastify'
import fastifyCookie from "fastify-cookie";
import registerAuthRoutes from './auth/routes';
import fastifyCors from '@fastify/cors';
import fastifyExpress from "@fastify/express";
import {configDotenv} from "dotenv";
import registerCategoryRoutes from "./category/routes";
import registerSpendingRoutes from "./spending/routes";
import redisRateLimiter from "./rateLimiter/middleware";

configDotenv();

const server = fastify()
server.register(fastifyCookie);

server.register(fastifyCors, {
    origin: ['http://localhost:5175', 'http://localhost:5176'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
});

server.get('/ping', async (request, reply) => {
    return 'pong\n'
})

registerAuthRoutes(server);

registerCategoryRoutes(server);

registerSpendingRoutes(server);

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err)
        process.exit(1)
    }
    console.log(`Server listening at ${address}`)
})