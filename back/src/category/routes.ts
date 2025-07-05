import {FastifyInstance} from "fastify";
import categoryRepository from "../repositories/CategoryRepository";
import extractAuthSession from "../auth/AuthSessionExtractor";
import {CategoryModel} from "../models/CategoryModel";
import authMiddleware from "../auth/middleware";


function registerCategoryRoutes(server: FastifyInstance) {
    server.get("/category", {
        preHandler: [authMiddleware],
        handler: async (request, reply) => {
            const authSession = (await extractAuthSession(request))!;
            const categories = await categoryRepository.getCategoriesOfUser(authSession.user.id);

            reply.code(200).send(categories);
        }
    });

    server.post("/category", {
        preHandler: [authMiddleware],
        handler: async (request, reply) => {
            const authSession = (await extractAuthSession(request))!;
            const category = request.body as CategoryModel;
            category.userId = authSession.user.id;

            const id = await categoryRepository.createCategory(category);
            category.id = id.toString();

            reply.code(200).send(category);
    }});

    server.put("/category", {
        preHandler: [authMiddleware],
        handler: async (request, reply) => {
            const authSession = (await extractAuthSession(request))!;

            const category = request.body as CategoryModel;
            if (authSession.user.id !== category.userId) {
                reply.code(403).send();
                return;
            }

            await categoryRepository.updateCategory(category);

            reply.code(200).send(category);
    }});

    server.delete("/category/:id", {
        preHandler: [authMiddleware],
        handler: async (request, reply) => {
            const authSession = (await extractAuthSession(request))!;

            const { id: categoryId } = request.params as { id: string };
            const category = await categoryRepository.getCategoryById(categoryId)
            if (!category) {
                reply.code(404).send();
                return;
            }

            if (authSession.user.id !== category?.userId) {
                reply.code(403).send();
                return;
            }

            await categoryRepository.deleteCategory(categoryId);

            reply.code(200).send();
    }});
}

export default registerCategoryRoutes;