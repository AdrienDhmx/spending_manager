import {useContext, useEffect} from "react";
import AuthContext from "../contexts/AuthContext.tsx";
import {useForm} from "react-hook-form";
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
import SignupSchema, { type SignupModel} from "../models/SignupModel.ts";


function SignupPage() {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof SignupSchema>>({
        resolver: zodResolver(SignupSchema),
        defaultValues: {
            firstname: '',
            lastname: '',
            email: '',
            password: ''
        }
    });

    const onSubmit = (data : SignupModel) => {
        auth.signup(data);
    }

    useEffect(() => {
        if (auth.user) {
            navigate('/')
        }
    }, [auth.user, navigate])

    return (
        <div className={"flex items-center justify-center h-full"}>
            <div className={"w-full max-w-xl flex flex-col gap-8"}>
                <h1 className="text-4xl font-medium text-center">Welcome Onboard</h1>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}
                           className="flex flex-col gap-4">

                        <div className="flex gap-4">
                            <FormField
                                control={form.control}
                                name="firstname"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Firstname</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Firstname" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="lastname"
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Lastname</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Lastname" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

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
                                        <Input placeholder="Password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit"
                                disabled={auth.loading}>
                            {auth.loading &&  <Loader2Icon className="animate-spin" />}
                            Signup
                        </Button>

                        <Link to="/signup"
                              className="text-primary text-center">
                            Login
                        </Link>
                    </form>
                </Form>
            </div>
        </div>
    )
}

export default SignupPage;