import { AtSign, Camera, CheckIcon, Loader2, User, UserRoundPen, X } from "lucide-react"
import { useAuthStore } from "../store/useAuthStore"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import { resizeImage } from "../lib/utils"

const ProfilePage = () => {
  const { user, isUpdatingProfilePic, isUpdating, updateProfile } = useAuthStore()
  const [selectedImg, setSelectedImg] = useState(null)
  const [userId, setUserId] = useState(user?.userId)
  const [name, setName] = useState(user?.name)
  const [userIdValidation, setUserIdValidation] = useState({
    isValid: true,
    noSpecialChar: true,
    oneLetter: true,
    oneNum: true,
    sixChar: true,
  })
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
  
    try {
      const resizedImage = await resizeImage(file);
      setSelectedImg(resizedImage);
      await updateProfile({ profilePic: resizedImage });
    } catch (err) {
      console.error("Error resizing image:", err);
      toast.error("Error occured when uploading image, please try again");
    }
  };

  useEffect(()=> {
    const newValidation = {};
    Object.keys(userIdValidation).forEach((key) => {
      newValidation[key] = checkValidUserId(key);
    });

    setUserIdValidation(newValidation);
  }, [userId])

  const checkValidUserId = (type='isValid') => {
    const regex = {
      isValid: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
      noSpecialChar: /^[A-Za-z\d]+$/,
      oneLetter: /[A-Za-z]/,
      oneNum: /\d/,
      sixChar: /^.{6,}$/,   
    };
    return regex[type].test(userId)
  }

  const handleUserProfileUpdate = async (e) => {
    e.preventDefault()

    if (!userIdValidation["isValid"]) return toast.error("Invalid user id")
    if (!name) return toast.error("Invalid display name")
    if (name && name.length > 10) return toast.error("Display name is too long, make it shorter than 10 characters")
    
    try {
      let updateBody = {}
      if (userId != user?.userId) updateBody["userId"] = userId
      if (name != user?.name) updateBody["name"] = name

      if (Object.keys(updateBody).length == 0) return

      await updateProfile(updateBody)
    } catch (error) {
      console.error("Error resizing image:", error);
      toast.error("Error occured when updating profile, please try again");
    }
  }

  return (
    <div className="min-h-screen h-full pt-20">
      <div className="max-w-2xl mx-auto p-4 py-8">
        <div className="bg-base-300 rounded-xl p-6 space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold">Profile</h1>
            <p className="mt-2">Your profile information</p>
          </div>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <img
                src={selectedImg || user.profilePic || "/avatar.png"}
                alt="Profile Pic"
                className="size-32 rounded-full object-cover border-4 "
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfilePic ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-5 h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfilePic}
                />
              </label>
            </div>
            <p className="text-sm text-zinc-400">
              {isUpdatingProfilePic ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <AtSign className="w-4 h-4" />
                Email Address
              </div>
              <input className="px-4 py-2.5 rounded-lg border w-full text-zinc-400" disabled={true} value={user?.email} />
            </div>

            <form onSubmit={(e) => handleUserProfileUpdate(e)}>
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Display Name
                </div>
                <input className={`px-4 py-2.5 rounded-lg border w-full focus:ring-1 focus:outline-none focus:ring-primary`} type="text" value={name} onChange={e => setName(e.target.value)}/>
              </div>
              
              <div className="space-y-1.5">
                <div className="text-sm text-zinc-400 flex items-center gap-2">
                  <UserRoundPen className="w-4 h-4" />
                  User ID
                </div>
                <div className="flex">
                <input className={`px-4 py-2.5 rounded-lg border w-full focus:ring-1 focus:outline-none ${userIdValidation["isValid"] ? 'focus:ring-primary' : 'focus:ring-error'}`} type="text" value={userId} onChange={e => setUserId(e.target.value)}/>
                </div>
                <p className={`text-xs flex items-center gap-1 ${!userIdValidation["noSpecialChar"] && 'text-error'}`}>{userIdValidation["noSpecialChar"] ? <CheckIcon className="size-3.5" /> : <X className="size-3.5" />}Only letters and numbers, no special characters allowed</p>
                <p className={`text-xs flex items-center gap-1 ${!userIdValidation["oneLetter"] && 'text-error'}`}>{userIdValidation["oneLetter"] ? <CheckIcon className="size-3.5" /> : <X className="size-3.5" />}At least one letter</p>
                <p className={`text-xs flex items-center gap-1 ${!userIdValidation["oneNum"] && 'text-error'}`}>{userIdValidation["oneNum"] ? <CheckIcon className="size-3.5" /> : <X className="size-3.5" />}At least one number</p>
                <p className={`text-xs flex items-center gap-1 ${!userIdValidation["sixChar"] && 'text-error'}`}>{userIdValidation["sixChar"] ? <CheckIcon className="size-3.5" /> : <X className="size-3.5" />}Be at least 6 characters</p>
              </div>

              <div className="flex flex-col md:flex-row w-full items-center justify-center gap-3 mt-4">
                <button className={`p-3 md:p-4 flex items-center rounded-lg border-e-2 ${(userId === user?.userId && name === user?.name) || !userIdValidation["isValid"] || !name || isUpdating ? 'cursor-default bg-gray-100' : 'bg-primary hover:bg-secondary'}`} type="submit" disabled={isUpdating || !userIdValidation["isValid"] || !name}>
                  {isUpdating ? <Loader2 /> : 'Save Changes'}
                </button>
                <p className={(userId === user?.userId && name === user?.name) || isUpdating ? 'cursor-default text-gray-200' : 'cursor-pointer text-primary'} onClick={() => {if(!isUpdating) setUserId(user?.userId); setName(user?.name);}}>Reset</p>
              </div>
            </form>
          </div>

          <div className="mt-6 bg-base-300 rounded-xl p-6">
            <h2 className="text-lg font-medium  mb-4">Account Information</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>{user.createdAt?.split("T")[0]}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Account Status</span>
                <span className="text-green-500">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfilePage