import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore";

const BASE_URL = 'http://localhost:7100';

export const useAuthStore = create((set, get) => ({
    user: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfilePic: false,
    isUpdating: false,
    isCheckingAuth: true,
    onlineUsers: [],
    socket: null,

    checkAuth: async () => {
        try {
            const res = await axiosInstance.get("/auth/check-auth");
            set({ user: res.data });

            get().connectSocket();
        } catch (error) {
            console.error("Error in checkAuth " + error);
            set({ user: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signUp: async (data) => {
        set({ isSigningUp: true });
        try {
            const res = await axiosInstance.post("/auth/signup", data);
            set({ user: res.data });
            toast.success(res.data.message);

            get().connectSocket();
        } catch (error) {
            console.error("Error in signUp " + error);
            toast.error(error.response.data.message);
        } finally {
            set({ isSigningUp: false });
        }
    },

    logout: async () => {
        try {
            const res = await axiosInstance.post("/auth/logout");
            set({ user: null });
            useChatStore.getState().setSelectedUser(null)
            toast.success(res.data.message);

            get().disconnectSocket();
        } catch (error) {
            console.error("Error in logout " + error);
            toast.error(error.response.data.message);
        }
    },

    login: async (data) => {
        set({ isLoggingIn: true });
        try {
            const res = await axiosInstance.post("/auth/login", data);
            set({ user: res.data });
            toast.success(res.data.message);

            get().connectSocket();
        } catch (error) {
            console.error("Error in login " + error);
            toast.error(error.response.data.message);
        } finally {
            set({ isLoggingIn: false });
        }
    },

    updateProfile: async (data) => {
        if (data["profilePic"]) set({ isUpdatingProfilePic: true });
        else set({ isUpdating: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ user: res.data });
            toast.success(res.data.message);
        } catch (error) {
            console.error("Error in updateProfile " + error);
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            if (data["profilePic"]) set({ isUpdatingProfilePic: false });
            else set({ isUpdating: false });
        }
    },

    updateFriends: async (data) => {
        set({ isUpdating: true })
        try {
            const res = await axiosInstance.post("/auth/update-friends", data);
            set({ user: res.data });
        } catch (error) {
            console.error("Error in updateFriends " + error);
            toast.error(error?.response?.data?.message || error?.response?.message || 'Something wrong, please try again');
        } finally {
            set({ isUpdating:false })
        }
    },

    connectSocket: () => {        
        const { user } = get();
        if (!user || get().socket?.connected) return;
        
        const socket = io(BASE_URL, {
            query: { 
                userId: user._id 
            },
        });
        socket.connect();
        set({ socket });

        socket.on("getOnlineUsers", (userIds) => {
            console.log("getOnlineUsers: ", userIds);
            set({ onlineUsers: userIds });
        });

        socket.on("friendsUpdated", (targetUserId) => {
            useChatStore.getState().getUsers();
            const selectedUser = useChatStore.getState().selectedUser
            console.log("t", targetUserId, "s", selectedUser._id);
            
            if (targetUserId && selectedUser?._id == targetUserId) useChatStore.getState().setSelectedUser(null)
        });
    },

    disconnectSocket: () => {
        if (get().socket?.connected) { 
            get().socket.disconnect();
            get().socket.off("friendsUpdated");
        }
    }
}));