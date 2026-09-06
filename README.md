# Musify - Music Player

A modern, full-stack music player web application built with React and Node.js. Upload, manage, and stream your favorite songs with a polished interface.

## Features

✨ **Core Features**
- 🎵 **Upload Songs** - Upload MP3, WAV, FLAC, or OGG files (up to 100MB)
- ▶️ **Playback Controls** - Play, pause, seek, and volume control
- 🎨 **Beautiful UI** - Modern glassmorphism design with smooth animations
- 🔐 **User Authentication** - Secure registration and login with JWT
- 🗑️ **Song Management** - Delete your own uploaded songs
- 🔍 **Search** - Full-text search across songs, artists, and albums
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

## Tech Stack

**Frontend:**
- React 18+
- React Router v6
- Vite v5
- CSS (Glassmorphism design)

**Backend:**
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Multer (File uploads)

**Storage:**
- Local disk storage (Development)
- MongoDB GridFS (Recommended for production)
- Cloudinary (Optional)

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/00RahulGattu00/musicplayerv2.git
cd musicplayerv2
```

2. **Install backend dependencies**
```bash
cd server
npm install
```

3. **Install frontend dependencies**
```bash
cd ../client
npm install
```

### Environment Setup

**Backend (.env file)**
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/musify
JWT_SECRET=your_super_secret_key_change_this
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NODE_ENV=development
```

### Running Locally

**Start MongoDB**
```bash
mongod
```

**Start Backend Server**
```bash
cd server
npm run dev
```
Backend will run on `http://localhost:5000`

**Start Frontend Dev Server** (in another terminal)
```bash
cd client
npm run dev
```
Frontend will run on `http://localhost:5173`

## Usage

1. **Register** - Create a new account with email and password
2. **Upload** - Go to Upload page and select an audio file
3. **Play** - Click Play on any song to start listening
4. **Controls** - Use volume slider and seek bar to control playback
5. **Delete** - Remove your own uploaded songs from the library
6. **Search** - Use the search to find songs by title, artist, or album

## Project Structure

```
musicplayerv2/
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # Auth & Player context
│   │   ├── hooks/       # Custom hooks
│   │   └── styles.css   # Global styles
│   └── package.json
├── server/              # Node.js backend
│   ├── routes/          # API route handlers
│   ├── models/          # MongoDB models
│   ├── middleware/      # Auth middleware
│   ├── config/          # Configuration files
│   ├── uploads/         # Local file storage
│   ├── server.js        # Express app setup
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Songs
- `GET /api/songs` - Get all songs
- `GET /api/songs/search` - Search songs
- `POST /api/upload/song` - Upload new song
- `DELETE /api/upload/song/:id` - Delete song (ownership required)

## Deployment

### Frontend Hosting on GitHub Pages (Automated via GitHub Actions)

The frontend is configured to automatically build and deploy to **GitHub Pages** using GitHub Actions:

1. **Push your code to GitHub:**
   ```bash
   git push origin main
   ```
2. **Enable GitHub Pages in your repository settings:**
   - Go to your repository on GitHub: `https://github.com/KodakandlaSahtihi-29/Musicplayer`
   - Click on **Settings** (top navigation tab)
   - In the left sidebar, click **Pages**
   - Under **Build and deployment** → **Source**, select **GitHub Actions**
3. **Your site is live!**
   - GitHub Actions will automatically run `.github/workflows/deploy.yml` on every push to `main`
   - Your live URL will be:
     `https://kodakandlasahtihi-29.github.io/Musicplayer/`
4. **Instant Demo Mode:**
   - Anyone visiting your GitHub Pages site can click **"Explore as Guest (Demo Mode)"** to immediately listen to sample music tracks, test seeking, and control playback without needing a database connection!

### Backend API Deployment (Optional / Production Full-Stack)

Since GitHub Pages hosts static web applications, if you wish to host your live Express backend and MongoDB in the cloud:
1. Connect this GitHub repo to a free Node.js host (such as **Render**, **Railway**, or **Fly.io**).
2. Set the Root Directory to `server`.
3. Configure environment variables in the host dashboard:
   - `MONGO_URI` (from MongoDB Atlas)
   - `JWT_SECRET`
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`
4. Set `CLIENT_ORIGIN` to your GitHub Pages URL: `https://kodakandlasahtihi-29.github.io`
5. In your frontend build or client `.env.production`, set `VITE_API_URL` to your backend's URL (e.g. `https://your-api.onrender.com/api`).

## Future Enhancements

- [ ] Playlist creation and management
- [ ] Song recommendations
- [ ] User profiles
- [ ] Social sharing
- [ ] Queue management
- [ ] Dark/Light theme toggle
- [ ] Music analytics

## Contributing

Feel free to fork this project and submit pull requests for any improvements!

## License

MIT License - feel free to use this project for personal or commercial purposes.

## Support

If you encounter any issues, please create an issue on GitHub.

---

**Made with ❤️ by Rahul**
