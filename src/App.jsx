// frontend_admin/src/App.jsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Layout from './components/Layout.jsx';
import Dashboard from './components/Dashboard.jsx';
import Users from './components/Users.jsx';
import Lines from './components/Lines.jsx';
import Instances from './components/Instances.jsx';
import Billing from './components/Billing.jsx';
import Audit from './components/Audit.jsx';
import Tariffs from './components/Tariffs.jsx';

/* GUARD */
function RequireAuth({ children }) {
  const token = localStorage.getItem('admin_token');
  return token ? children : <Navigate to="/login" replace />;
}
/* /GUARD */

export default function App() {
  return (
    <BrowserRouter basename="/panel">

      {/* ROUTES */}
      <Routes>

        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <RequireAuth>
              <Layout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"  element={<Dashboard />} />
          <Route path="users"      element={<Users />} />
          <Route path="lines"      element={<Lines />} />
          <Route path="instances"  element={<Instances />} />
          <Route path="billing"    element={<Billing />} />
          <Route path="audit"      element={<Audit />} />
          <Route path="tariffs"    element={<Tariffs />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />

      </Routes>
      {/* /ROUTES */}

    </BrowserRouter>
  );
}