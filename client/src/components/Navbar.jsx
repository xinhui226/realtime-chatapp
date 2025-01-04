import { Link } from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"
import { LogOut, MessagesSquare, Settings, User } from "lucide-react"

const Navbar = () => {
    const { user, logout } = useAuthStore()

    return (
        <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80">
            <div className="container mx-auto px-4 h-16">
                <div className="flex items-center justify-between h-full">
                    {/* logo */}
                    <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
                        <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <MessagesSquare className="size-5 text-primary" />
                        </div>
                        <h1 className="text-md font-bold">Chat and Connect</h1>
                    </Link>

                    {/* pages */}
                    <div className="flex items-center gap-2">
                        <Link
                            to="/setting"
                            className='btn btn-sm gap-2 transition-colors bg-transparent border-none hover:bg-base-200'>
                            <Settings className="w-4 h-4" />
                            <span className="hidden sm:inline">Settings</span>
                        </Link>

                        {user && (
                            <>
                                <Link to="/profile" className='btn btn-sm gap-2 transition-colors bg-transparent border-none hover:bg-base-200'>
                                    <User className="size-5" />
                                    <span className="hidden sm:inline">Profile</span>
                                </Link>
                                <button className="flex gap-2 items-center hover:bg-base-200 p-2 rounded" onClick={logout}>
                                    <LogOut className="size-5" />
                                    <span className="hidden sm:inline">Logout</span>
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Navbar