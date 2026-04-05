import React from "react";
import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom";

import Player from "./components/Player/Player";
import Sidebar from "./components/Sidebar/Sidebar";
import NowPlaying from "./components/NowPlaying/NowPlaying";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Library from "./pages/Library";
import Playlist from "./pages/Playlist";
import Upload from "./pages/Upload";
import Login from "./pages/Login";
import Register from "./pages/Register";

function AppLayout() {
  return (
    <>
      <div className="app-layout">
        <Sidebar />
        <main>
          <Outlet />
        </main>
        <aside>
          <NowPlaying />
        </aside>
      </div>
      <Player />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="library" element={<Library />} />
            <Route path="playlist/:id" element={<Playlist />} />
            <Route path="upload" element={<Upload />} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

