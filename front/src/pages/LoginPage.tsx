import {useContext, useEffect} from "react";
import AuthContext from "../contexts/AuthContext.tsx";
import {useForm} from "react-hook-form";
import CredentialsSchema, {type CredentialsModel} from "../models/CredentialsModel.ts";
import {z} from "zod";
import { zodResolver } from "@hookform/resolvers/zod"
import {Loader2Icon} from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../components/ui/form.tsx";
import {Input} from "../components/ui/input.tsx";
import {Button} from "../components/ui/button.tsx";
import {Link, useNavigate} from "react-router";


function LoginPage() {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof CredentialsSchema>>({
        resolver: zodResolver(CredentialsSchema),
    });

    const onSubmit = (data : CredentialsModel) => {
        auth.login(data);
    }

    useEffect(() => {
        if (auth.user) {
            navigate('/')
        }
    }, [auth.user, navigate])

    return (
        <div className={"flex items-center justify-center h-full"}>
            <div className={"w-full max-w-96 flex flex-col gap-8"}>
                <h1 className="text-4xl font-medium text-center">Login</h1>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}
                           className="flex flex-col gap-4">

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="your@email.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input placeholder="************" {...field} type="password" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit"
                                disabled={auth.loading}>
                            {auth.loading &&  <Loader2Icon className="animate-spin" />}
                            Login
                        </Button>

                        <Link to="/signup"
                              className="text-primary text-center">
                            Create an account
                        </Link>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default LoginPage;