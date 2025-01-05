import { MessagesSquare, Users, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import toast from "react-hot-toast";

const NoChatSelected = () => {
  const [addFriend, setAddFriend] = useState(false)
  const [userId, setUserId] = useState('')
  const { updateFriends, isUpdating } = useAuthStore()

  const handleAddFriend = async (e) => {
    e.preventDefault()

    try {
      await updateFriends({ action: 'add', targetUserId: userId })
    } catch (error) {
      console.error("Error addFriend:", error);
      toast.error("Error occured when adding friend, please try again");
    }
  }

  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-4 sm:p-16 bg-base-100/50">
      {!addFriend ? (
        <div className="max-w-md text-center space-y-6">
          {/* Icon Display */}
          <div className="flex justify-center gap-4 mb-4">
            <div className="relative">
              <div
                className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center
              justify-center animate-bounce"
              >
                <MessagesSquare className="w-8 h-8 text-primary " />
              </div>
            </div>
          </div>

          {/* Welcome Text */}
          <h2 className="text-xl md:text-2xl font-bold">Welcome to Chat and Connect!</h2>
          <p className="text-base-content/60">
            Select a conversation from the sidebar to start chatting
          </p>

          <button className="btn glass rounded-lg bg-primary" onClick={() => setAddFriend(true)}><Users /> Add friend</button>
        </div>
      ) :
        <div className="w-full h-full">
          <div className="flex justify-between items-center">
            <h2 className="text-xl md:text-2xl font-bold">Add friend</h2>
            <X className="size-4 sm:size-6 cursor-pointer" onClick={() => setAddFriend(false)}/>
          </div>
          <p className="text-base-content/60 text-sm">You can add friends with their user ids.</p>
          <form onSubmit={(e) => handleAddFriend(e)}>
            <label className="mt-5 input input-bordered flex items-center gap-2 py-[1rem] sm:py-[2rem] focus:ring-0 focus:outline-none focus:outline-offset-0">
              <input type="text" className="grow" placeholder="johndoe701" onChange={(e)=>setUserId(e.target.value)}/>
              <button className="hidden sm:block btn ghost bg-primary" disabled={!userId || isUpdating}>Add friend</button>
            </label>
            <button className="sm:hidden block btn ghost bg-primary mt-3 mx-auto" type="submit" disabled={!userId}>Add friend</button>
          </form>
        </div>
      }
  </div>
  );
};

export default NoChatSelected;