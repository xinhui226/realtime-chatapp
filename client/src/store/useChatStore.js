import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessagesLoading: false,

    getUsers: async () => {
        set({ isUsersLoading: true });
        try {
            const res = await axiosInstance.get("/message/users");
            set({ users: res.data });
        } catch (error) {
            console.error("Error in getUsers " + error);
            toast.error(error.response.data.message);
        } finally {
            set({ isUsersLoading: false });
        }
    },

    getMessages: async (user_id) => {
        set({ isMessagesLoading: true });
        try {
            const res = await axiosInstance.get(`/message/${user_id}`);
            set({ messages: res.data });
        } catch (error) {
            console.error("Error in getMessages " + error);
            toast.error(error.response.data.message);
        } finally {
            set({ isMessagesLoading: false });
        }
    },

    sendMessage: async (data) => {
        const { selectedUser, messages } = get()
        try {
            const res = await axiosInstance.post(`/message/send-message/${selectedUser._id}`, data);
            set({ messages: [...messages, res.data] });
        } catch (error) {
            console.error("Error in sendMessage " + error);
            toast.error(error.response.data.message);
        }
    },

    listenToMessage: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage) => {
            if (newMessage.senderId !== selectedUser._id) return;
            
            set({ messages: [...get().messages, newMessage] });
        });
    },

    stopListeningToMessage: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (selectedUser) => set({ selectedUser })
}))