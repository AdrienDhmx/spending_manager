import {BrowserRouter, Route, Routes} from "react-router";
import AuthContext from "./contexts/AuthContext.tsx";
import useAuth from "./hooks/UseAuth.tsx";
import RequireAuth from "./components/RequireAuth.tsx";
import DashboardPage from "./pages/DashboardPage.tsx";
import LoginPage from "./pages/LoginPage.tsx";
import Error404Page from "./pages/Error404Page.tsx";
import {SidebarInset, SidebarProvider, SidebarTrigger} from "./components/ui/sidebar.tsx";
import AppSidebar from "./components/AppSidebar.tsx";
import SignupPage from "./pages/SignupPage.tsx";
import CategoryPage from "./pages/CategoryPage.tsx";
import SpendingPage from "./pages/SpendingPage.tsx";

function App() {
  const auth = useAuth();

  return (
    <BrowserRouter>
        <AuthContext.Provider value={auth}>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <SidebarTrigger className="m-1"/>
                    <div className="@container/main flex flex-1 flex-col gap-2">
                        <Routes>
                            <Route path="/login" element={<LoginPage />}/>
                            <Route path="/signup" element={<SignupPage />}/>
                            <Route index element={<RequireAuth><DashboardPage/></RequireAuth>} />
                            <Route path="/spending" element={<RequireAuth><SpendingPage/></RequireAuth>} />
                            <Route path="/category" element={<RequireAuth><CategoryPage/></RequireAuth>} />

                            <Route path="*" element={<Error404Page />}/>
                        </Routes>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </AuthContext.Provider>
    </BrowserRouter>
  )
}

export default App
