import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router';
import AddEntry from './pages/AddEntry';
import Dashboard from './pages/Dashboard';
import EditEntry from './pages/EditEntry';
import History from './pages/History';

export default function App() {
  return (
    <BrowserRouter>
      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand">FinMan</Link>
          <nav className="nav" aria-label="Main">
            <NavLink to="/" end>Dashboard</NavLink>
            <NavLink to="/add">Add entry</NavLink>
            <NavLink to="/history">History</NavLink>
          </nav>
        </div>
      </header>
      <main className="container">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/add" element={<AddEntry />} />
          <Route path="/history" element={<History />} />
          <Route path="/history/:id/edit" element={<EditEntry />} />
          <Route path="*" element={<div className="empty"><p>Page not found.</p><Link to="/">Go to dashboard</Link></div>} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
