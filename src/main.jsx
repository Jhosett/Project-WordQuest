import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'
import App from './App.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import UserProfile from './pages/UserProfile.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Games from './pages/Games.jsx'
import AdventureShelf from './pages/AdventureShelf.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import BooksAdmin from './pages/admin/books/BooksAdmin.jsx';
import ChaptersAdmin from './pages/admin/books/ChaptersAdmin.jsx';
import GamesAdmin from './pages/admin/GamesAdmin.jsx';
import AddKeyword from './pages/admin/games/AddKeyword.jsx';
import AddSentence from './pages/admin/games/AddSentence.jsx';
import ChapterSelection from './pages/ChapterSelection.jsx';
import ChapterMissions from './pages/ChapterMissions.jsx';
import KeyWordsMode from './pages/gamemodes/KeyWordsMode.jsx';
import CompletePhraseMode from './pages/gamemodes/CompletePhraseMode.jsx';
import OrderSequenceMode from './pages/gamemodes/OrderSequenceMode.jsx';
import AddOrderPhrase from './pages/admin/games/AddOrderPhrase.jsx';
import EditKeywords from './pages/admin/games/EditKeywords.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/Project-WordQuest">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/user-profile" element={<UserProfile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/games" element={<Games />} />
        <Route path="/adventure-shelf" element={<AdventureShelf />} />
        <Route path="/adventure" element={<AdventureShelf />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/books" element={<BooksAdmin />} />
        <Route path="/admin/chapters" element={<ChaptersAdmin />} />
        <Route path="/admin/games" element={<GamesAdmin />} />
        <Route path="/admin/games/add-keyword" element={<AddKeyword />} />
        <Route path="/admin/games/add-sentence" element={<AddSentence />} />
        <Route path="/admin/games/add-sequence" element={<AddOrderPhrase />} />
        <Route path="/admin/games/edit-keywords" element={<EditKeywords />} />
        <Route path="/chapter-selection" element={<ChapterSelection />} />
        <Route path="/chapter-missions" element={<ChapterMissions />} />
        <Route path="/keywords-mode" element={<KeyWordsMode />} />
        <Route path="/complete-phrase-mode" element={<CompletePhraseMode />} />
        <Route path="/order-sequence-mode" element={<OrderSequenceMode />} />
        <Route path="/add-sequence" element={<AddOrderPhrase />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
