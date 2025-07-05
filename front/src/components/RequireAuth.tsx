import {useContext} from "react";
import AuthContext from "../contexts/AuthContext.tsx";
import {Navigate, Outlet} from "react-router";


function RequireAuth({children}) {
    const authContext = useContext(AuthContext);

    if (!authContext.user) {
        console.log("User is not logged in, redirecting to login page...")
        return <Navigate to={'/login'} replace />
    }

    return children ?? <Outlet />;
}

export default RequireAuth;