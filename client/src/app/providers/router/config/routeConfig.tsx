import { MainPage } from "../../../../pages/main-page";
import { lazy } from "react";

const LoginPage = lazy(() =>
  import("../../../../pages/login-page").then((module) => ({
    default: module.LoginPage,
  })),
);

const RegistrationPage = lazy(() =>
  import("../../../../pages/registration-page").then((module) => ({
    default: module.RegistrationPage,
  })),
);

const ChatPage = lazy(() =>
  import("../../../../pages/chat-page").then((module) => ({
    default: module.ChatPage,
  })),
);

const ProfilePage = lazy(() =>
  import("../../../../pages/profile-page/ui/ProfilePage").then((module) => ({
    default: module.ProfilePage,
  })),
);

const MessagePage = lazy(() =>
  import("../../../../pages/conversation-page/ui/ConversationPage").then(
    (module) => ({
      default: module.MessagePage,
    }),
  ),
);

export const publicRoutes = [
  { path: "/", element: <MainPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/registration", element: <RegistrationPage /> },
];

export const privateRoutes = [
  { path: "/chat/:userId/:username", element: <ChatPage /> },
  { path: "/profile", element: <ProfilePage /> },
  { path: "/message", element: <MessagePage /> },
];
