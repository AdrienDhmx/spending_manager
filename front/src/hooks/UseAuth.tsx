import {useEffect, useState} from "react";
import type {UserModel} from "../models/UserModel.ts";
import type {CredentialsModel} from "../models/CredentialsModel.ts";
import type {AuthContextModel} from "../contexts/AuthContext.tsx";
import type {SignupModel} from "../models/SignupModel.ts";
import api from "../utils/ApiUtils.ts";

function useAuth() : AuthContextModel {
    const [user, setUser] = useState<UserModel | undefined>(undefined);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(undefined);

    useEffect(() => {
        setLoading(true)
        api.get("auth/me")
            .then(response => response.json())
            .then(data => setUser(data as UserModel))
            .finally(() => setLoading(false))
    }, [])

    const login = (credentials: CredentialsModel) => {
        setLoading(true);

        api.post("auth/login", { json: credentials })
            .then(response => response.json())
            .then(data => setUser(data as UserModel))
            .catch(error => setError(error))
            .finally(() => setLoading(false));
    }

    const logout = () => {
        api.delete("auth/logout");
        setUser(undefined);
    }

    const signin = (userInformation: SignupModel) => {
        setLoading(true);

        api.post("auth/signup", { json: userInformation })
            .then(response => response.json())
            .then(data => setUser(data as UserModel))
            .catch(error => setError(error))
            .finally(() => setLoading(false));
    }

    return {
        user,
        loading,
        error,

        login,
        logout,
        signup: signin
    }
}

export default useAuth;