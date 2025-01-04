export const resizeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();
  
      // Load the file into a data URL
      reader.onload = (e) => {
        img.src = e.target.result; // Set the image source
      };
  
      reader.onerror = (error) => reject(error); // Reject if file reading fails
  
      // Once the image is loaded
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        // Set desired dimensions while maintaining aspect ratio
        const maxWidth = 500;
        const scale = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scale;
  
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
        // Convert canvas content to a data URL (JPEG, 80% quality)
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
  
      img.onerror = (error) => reject(error); // Reject if image loading fails
  
      reader.readAsDataURL(file); // Start reading the file
    });
  };

export const formatMessageTime = (datetime) => {
  const date = new Date(datetime);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const year = date.getFullYear();
  const formattedTime = date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
  });
  return `${day}/${month}/${year} ${formattedTime}`;
}