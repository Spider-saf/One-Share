# One-Share

A beautiful photo sharing application with folders, profiles, and a mates system.

## Features

- **Folders (Communities)**: Create or join public/private photo sharing folders (max 20 photos per folder)
- **User Profiles**: Share photos on your personal profile without joining folders
- **Mates System**: Connect with other users through friend requests (called "mates")
- **Aesthetic Design**: Sleek black interface with high-quality photo support
- **Photo Quality**: Optimized image storage and delivery

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Frontend**: React + Tailwind CSS
- **Image Processing**: Sharp
- **Storage**: Cloudinary (optional) / Local storage

## Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure `.env` file
4. Run the server: `npm run dev`

## Project Structure

```
one-share/
├── server.js
├── config/
├── models/
│   ├── User.js
│   ├── Folder.js
│   ├── Photo.js
│   └── Mate.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── folders.js
│   ├── photos.js
│   └── mates.js
├── controllers/
├── middleware/
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── App.js
└── uploads/
