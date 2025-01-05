import { EllipsisVertical, X } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { isUpdating, updateFriends } = useAuthStore();
  const { onlineUsers } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null)

  const handleRemoveFriend = async () => {
    try {
      await updateFriends({ action: 'remove', targetUserId: selectedUser.userId })
    } catch (error) {
      console.error("Error addFriend:", error);
      toast.error("Error occured when adding friend, please try again");
    }
  }

  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex sm:flex-row-reverse items-center gap-3">
        <div className="flex items-center justify-between gap-3 w-full">

          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div className="avatar">
              <div className="size-10 rounded-full relative">
                <img src={selectedUser.profilePic || "/avatar.png"} alt={selectedUser.name} />
              </div>
            </div>

            {/* User info */}
            <div>
              <h3 className="font-medium">{selectedUser.name}</h3>
              <p className="text-sm text-base-content/70">
                {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
              </p>
            </div>
          </div>
        
          <div className="relative" ref={menuRef}>
            {/* Remove friend option */}
            <button className="place-items-end" onClick={() => setIsOpen(!isOpen)}>
              <EllipsisVertical className="size-5" />
            </button>
            {isOpen && (
              <div
              className="absolute right-0 mt-2 w-40 bg-base-100 rounded-md shadow-lg z-10"
            >
              <ul className="menu p-2">
                <li>
                  <button onClick={handleRemoveFriend} disabled={isUpdating}>
                    Remove Friend
                  </button>
                </li>
              </ul>
            </div>
            )}
          </div>

        </div>
        {/* Close button */}
        <button className="hidden sm:flex" onClick={() => setSelectedUser(null)}>
          <X className="size-4 md:size-6" />
        </button>
      </div>
    </div>
  );
};
export default ChatHeader;