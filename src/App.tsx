
import { RouterProvider, createBrowserRouter, BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import SignIn from "./components/SignIn";
import SignUp from "./components/SignUp";
import Profile from "./pages/Profile";
import CreateProfile from "./pages/CreateProfile";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import Messages from "./pages/Messages";
import EventDetails from "./pages/EventDetails";
import EventCreate from "./pages/EventCreate";
import ContentCreation from "./pages/ContentCreation";
import NotFound from "./pages/NotFound";
import QuickEvent from "./pages/QuickEvent";
import "./App.css";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Index />,
    },
    {
      path: "/signin",
      element: <SignIn />,
    },
    {
      path: "/signup",
      element: <SignUp />,
    },
    {
      path: "/profile",
      element: <Profile />,
    },
    {
      path: "/create-profile",
      element: <CreateProfile />,
    },
    {
      path: "/dashboard",
      element: <Dashboard />,
    },
    {
      path: "/explore",
      element: <Explore />,
    },
    {
      path: "/messages",
      element: <Messages />,
    },
    {
      path: "/events/:eventId",
      element: <EventDetails />,
    },
    {
      path: "/events/create",
      element: <EventCreate />,
    },
    {
      path: "/content-creation",
      element: <ContentCreation />,
    },
    {
      path: "/quick-event",
      element: <QuickEvent />,
    },
    {
      path: "*",
      element: <NotFound />,
    }
  ]);

  return (
    <BrowserRouter>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-center" />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
