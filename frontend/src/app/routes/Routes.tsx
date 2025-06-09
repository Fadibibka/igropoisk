import { RouteObject } from "react-router-dom";
import { lazy } from "react";
import ProtectedRoute from "./Guard/ProtectedRoute"; // путь подкорректируй под себя

const Home = lazy(() => import('@pages/mainPage/home'));
const GamesPage  = lazy(() => import('@pages/gamesPage/catalog'));
const CategoryPage  = lazy(() => import('@pages/categoryPage/category'));
const GamePage  = lazy(() => import('@pages/gamePage/game'));
const JournalPage  = lazy(() => import('@pages/journalPage/journal'));
const LoginPage  = lazy(() => import('@pages/loginPage/login'));
const RegPage  = lazy(() => import('@pages/loginPage/reg'));
const UserPage = lazy(() => import('@pages/userPage/my'));
const AdminPage = lazy(() => import('@pages/adminPage/admin'));
const ReviewsPage = lazy(() => import('@pages/reviewsPage/reviews'));
const ArticlePage  = lazy(() => import('@pages/articlePage/article'));
const RecPage  = lazy(() => import('@pages/recPage/recomendation'));


const Routes: RouteObject[] = [
  { path: '/', element: <Home /> },
  { path: '/games/*', element: <GamesPage /> },
  { path: '/category/:genreId', element: <CategoryPage /> },
  { path: '/game/:gameId', element: <GamePage /> },
  { path: '/game/:gameId/reviews', element: <ReviewsPage /> },
  { path: '/journal/', element: <JournalPage /> },
  { path: '/login/', element: <LoginPage /> },
  { path: '/reg/', element: <RegPage /> },
  { path: '/journal/article/:articleId', element: <ArticlePage /> },
  { path: '/recommendations', element: <RecPage /> },
  {
    path: '/my/',
    element: (
      <ProtectedRoute>
        <UserPage />
      </ProtectedRoute>
    )
  },
  {
    path: '/admin/',
    element: (
      <ProtectedRoute requireAdmin>
        <AdminPage />
      </ProtectedRoute>
    )
  }
];

export default Routes;
