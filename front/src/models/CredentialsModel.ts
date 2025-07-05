import * as z from "zod/v4";


export interface CredentialsModel {
    email: string,
    password: string,
}

const CredentialsSchema = z.object({
    email: z.email(),
    password: z.string(),
});

export default CredentialsSchema;