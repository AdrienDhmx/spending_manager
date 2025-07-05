import {createContext} from "react";
import type {UserModel} from "../models/UserModel.ts";
import type {CredentialsModel} from "../models/CredentialsModel.ts";
import type {SignupModel} from "../models/SignupModel.ts";

export interface AuthContextModel {
    user?: UserModel,
    login: (credentials: CredentialsModel) => void,
    logout: () => void,
    signup: (userInformation: SignupModel) => void,
    loading: boolean,
    error?: string,
}

const AuthContext = createContext<AuthContextModel>({
    user: undefined,
    login: (credentials: CredentialsModel) => {},
    logout: () => {},
    signup: (credentials: SignupModel) => {},
    loading: false,
    error: undefined,
});

export default AuthContext;