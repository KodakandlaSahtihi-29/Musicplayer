# Spotify Clone Backend

## Setup

1. Install dependencies:
   npm install
2. Create a .env file from .env.example.
3. Start MongoDB locally or use MongoDB Atlas.
4. Run in development:
   npm run dev

## API Routes

- Auth: /api/auth/register, /api/auth/login, /api/auth/logout
- Songs: /api/songs, /api/songs/:id, /api/songs/search?q=...
- Playlists: /api/playlists (CRUD)
- Users: /api/users/profile, /api/users/:id/follow, /api/users/:id/unfollow
