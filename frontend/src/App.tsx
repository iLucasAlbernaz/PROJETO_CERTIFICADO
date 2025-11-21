import { Route, Routes } from 'react-router-dom';
import { PublicLookup } from './pages/PublicLookup';
import { AdminLogin } from './pages/AdminLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AppHeader } from './components/AppHeader';

const App = () => {
  return (
    <>
      <AppHeader />
      <div className="app-layout">
        <Routes>
          <Route path="/" element={<PublicLookup />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
        </Routes>
      </div>
    </>
  );
};

export default App;
