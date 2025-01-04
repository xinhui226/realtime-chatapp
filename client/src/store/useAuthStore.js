import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const BASE_URL = 'http://localhost:7100';

export const useAuthStore = create((set, get) => ({
    user: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
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
        set({ isUpdatingProfile: true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", data);
            set({ user: res.data });
            toast.success(res.data.message);
        } catch (error) {
            console.error("Error in updateProfile ");
            console.error(error);
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            set({ isUpdatingProfile: false });
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
    },

    disconnectSocket: () => {
        if (get().socket?.connected) get().socket.disconnect();
    }
}));