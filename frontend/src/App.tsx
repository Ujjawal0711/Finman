import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router';
import Icon from './components/Icon';
import AddEntry from './pages/AddEntry';
import Dashboard from './pages/Dashboard';
import EditEntry from './pages/EditEntry';
import History from './pages/History';

export default function App() {
  return (
    <BrowserRouter>
      <div className="shell">
        <aside className="rail">
          <Link to="/" className="brand" aria-label="FinMan home">
            <span className="brand-mark" aria-hidden="true">₹</span>
            <span className="brand-name">FinMan</span>
          </Link>
          <nav className="nav" aria-label="Main">
            <NavLink to="/" end><Icon name="dashboard" /><span>Dashboard</span></NavLink>
            <NavLink to="/history"><Icon name="receipt" /><span>Transactions</span></NavLink>
          </nav>
          <NavLink to="/add" className="rail-cta"><Icon name="plus" size={16} /> New entry</NavLink>
          <p className="rail-foot">Paste a bank SMS or snap a bill. FinMan reads it; you confirm it.</p>
        </aside>
        <main className="main">
          <div className="container">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add" element={<AddEntry />} />
              <Route path="/history" element={<History />} />
              <Route path="/history/:id/edit" element={<EditEntry />} />
              <Route path="*" element={<div className="empty"><strong>Page not found</strong><Link to="/">Back to dashboard</Link></div>} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
