import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import TitlePage from "./Components/TitlePage";
import "./index.css";
import Nav from "./Nav/Nav";
import { AuthProvider } from "./contexts/AuthContext";
import Feed from "./Components/Feed";
import Login from "./Components/Login";
import Reg from "./Components/Reg";
import Post from "./Components/Post";
import EditPost from "./Components/EditPost";
import Profile from "./Components/Profile";
import MyFeed from "./Components/MyFeed";
const App = () => {
  const location = useLocation();
  const isFeedPath = location.pathname === "/feed";

  return (
    <div
      className={`flex flex-col bg-primary min-h-screen ${
        isFeedPath ? "bg-img-ball" : " bg-img-funnel"
      }`}
    >
      <Nav />
      <Routes>
        <Route path="/" element={<TitlePage />} />
        <Route path="/feed" element={<Feed />} />
        <Route path="/my-posts" element={<MyFeed />} />
        <Route path="/login" element={<Login />} />
        <Route path="/reg" element={<Reg />} />
        <Route path="/post" element={<Post />} />
        <Route path="/edit" element={<EditPost />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </div>
  );
};

function MainApp() {
  return (
    <AuthProvider>
      <Router>
        <App />
      </Router>
    </AuthProvider>
  );
}

export default MainApp;
