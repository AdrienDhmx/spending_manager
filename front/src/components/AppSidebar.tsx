import {
    Home, LucideCoins,
    LucideEllipsisVertical,
    LucideLogIn,
    LucideLogOut,
    LucideTag,
    LucideUserCircle,
    Settings
} from "lucide-react"
import {
    Sidebar,
    SidebarContent, SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu, SidebarMenuButton,
    SidebarMenuItem
} from "./ui/sidebar.tsx";
import {DropdownMenu, DropdownMenuContent,
    DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger} from "./ui/dropdown-menu.tsx";
import {Avatar, AvatarFallback } from "./ui/avatar.tsx";
import {useContext} from "react";
import AuthContext from "../contexts/AuthContext.tsx";
import {Link} from "react-router";


const items = [
    {
        title: "Dashboard",
        url: "/",
        icon: Home,
    },
    {
        title: "Spendings",
        url: "/spending",
        icon: LucideCoins,
    },
    {
        title: "Categories",
        url: "/category",
        icon: LucideTag,
    },
    {
        title: "Settings",
        url: "/settings",
        icon: Settings,
    },
]

export default function AppSidebar() {
    return (
        <Sidebar variant="inset">
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>
                        SpendingManager
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton asChild>
                                        <Link to={item.url}>
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>
                <UserMenuButton />
            </SidebarFooter>
        </Sidebar>
    )
}

function UserMenuButton() {
    const {user, logout} = useContext(AuthContext);

    if (!user) {
        return (
            <SidebarMenuItem className="list-none">
                <SidebarMenuButton asChild>
                    <Link to="/login">
                        <LucideLogIn/>
                        <span>Login</span>
                    </Link>
                </SidebarMenuButton>
            </SidebarMenuItem>
        )
    }
    const initials = user!.firstname[0].toUpperCase() + user!.lastname[0].toUpperCase();
    const fullname = `${user.firstname} ${user.lastname}`

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <Avatar className="h-8 w-8 rounded-lg grayscale">
                        <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">{fullname}</span>
                        <span className="text-muted-foreground truncate text-xs">
                            {user!.email}
                        </span>
                    </div>
                    <LucideEllipsisVertical className="ml-auto size-4" />
                </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                align="end"
                sideOffset={4}
            >
                <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                            <AvatarFallback className="rounded-lg">{initials}</AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">{fullname}</span>
                            <span className="text-muted-foreground truncate text-xs">
                                {user!.email}
                            </span>
                        </div>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <LucideUserCircle />
                        Account
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem variant="destructive"
                                    onClick={logout}>
                    <LucideLogOut />
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}