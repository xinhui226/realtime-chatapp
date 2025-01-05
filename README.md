# 🎉 Real-Time Chat App

A responsive real-time chat application that enables users to connect with friends and personalize their experience. The app focuses on real-time updates for friend management and website theme customization.

## Features

- 👫 _**Real-Time Friend Management:**_
  - Add friends using their unique userid with real-time updates reflected for both users.
  - Remove friends, with real-time updates reflected for both users.
- 🎨 _**Personalized Themes:**_
  - Choose a theme to personalize the website’s appearance.
- 🔒 _**User Authentication:**_
  - Secure login and registration system.

## Tech Stack

- **Frontend:** React, Tailwind, DaisyUI
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Real-Time Communication:** Socket.IO
- **Hosting:** Render

## Setup `.env` File

   ```bash
  PORT=7100
  MONGODB_URI=...
  JWT_SECRET=...
  CLOUDINARY_CLOUD_NAME=...
  CLOUDINARY_API_KEY=...
  CLOUDINARY_API_SECRET=...
  CLIENT_URL=http://localhost:5173
  NODE_ENV=development
  ```

## Build the app
Run this command to build the app for production:
  ```bash
  npm run build
  ```

## Start the app
Start the application with:
  ```bash
  npm start
  ```

And access the app at http://localhost:5173 🎉

<br>

## Usage

- _Register or Log In:_
  - Create an account or log in with existing credentials.
- _Add Friends:_
  - Use the unique userid of a friend to add them. Updates are reflected in real-time for both users.
- _Remove Friends:_
  - Unfriend users, with updates reflected in real-time for both sides.
- _Customize Theme:_
  - Choose a theme to personalize the website’s appearance.
