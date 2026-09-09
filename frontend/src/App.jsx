import { useEffect } from 'react'
import { useNavigate, useRoutes } from 'react-router-dom'

import Dashboard from './components/dashboard/Dashboard'
import Profile from './components/user/Profile'
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import RepoDetail from "./components/repo/RepoDetail";
import GlobalIssues from "./components/issue/GlobalIssues";
import IssueDetail from "./components/issue/IssueDetail";

import { useAuth } from "./contexts/AuthContext";

function App() {
  const { currentUser, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const userIdFromStorage = localStorage.getItem("userId");

    if (userIdFromStorage && !currentUser) {
      setCurrentUser(userIdFromStorage);
    }

    if (!userIdFromStorage && !["/auth", "/signup"].includes(window.location.pathname)) {
      navigate("/auth");
    }

    if (userIdFromStorage && window.location.pathname == '/auth') {
      navigate("/");
    }
  }, [currentUser, navigate, setCurrentUser]);

  let routeElements = useRoutes([{
    path: "/",
    element: <Dashboard />
  },
  {
    path: "/auth",
    element: <Login />
  },
  {
    path: "/signup",
    element: <Signup />
  },
  {
    path: "/profile",
    element: <Profile />
  },
  {
    path: "/repo/:id",
    element: <RepoDetail />
  },
  {
    path: "/repository/:id",
    element: <RepoDetail />
  },
  {
    path: "/issues",
    element: <GlobalIssues />
  },
  {
    path: "/issues/:id",
    element: <IssueDetail />
  },
  {
    path: "/issue/:id",
    element: <IssueDetail />
  },
  {
    path: "/repo/:repoId/issues/:issueId",
    element: <IssueDetail />
  }
  ]);

  return (routeElements);
}

export default App;
