import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Books } from './pages/Books';
import { ChapterReader } from './pages/ChapterReader';
import { Collection } from './pages/Collection';
import { AuthorDashboard } from './pages/AuthorDashboard';
import { ChapterManager } from './pages/ChapterManager';
import { AuthorStats } from './pages/AuthorStats';
import { ReadingHistory } from './pages/ReadingHistory';
import { AdminDashboard } from './pages/AdminDashboard';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        children: [
            {
                path: '/',
                element: <Home />,
            },
            {
                path: '/login',
                element: <Login />,
            },
            {
                path: '/register',
                element: <Register />,
            },
            {
                path: '/books',
                element: <Books />,
            },
            {
                path: '/collection',
                element: <Collection />,
            },
            {
                path: '/history',
                element: <ReadingHistory />,
            },
            {
                path: '/author/books',
                element: <AuthorDashboard />,
            },
            {
                path: '/author/books/:bookId/chapters',
                element: <ChapterManager />,
            },
            {
                path: '/author/stats',
                element: <AuthorStats />,
            },
            {
                path: '/books/:bookId/chapters/:chapterId',
                element: <ChapterReader />,
            },
            {
                path: '/admin',
                element: <AdminDashboard />,
            },
        ],
    },
]);

