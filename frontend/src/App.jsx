import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Transactions from './pages/Transactions.jsx';
import Accounts from './pages/Accounts.jsx';
import Categories from './pages/Categories.jsx';

function isAuthenticated() {
  return Boolean(localStorage.getItem('token'));
}

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/transacoes"
        element={
          <PrivateRoute>
            <Layout>
              <Transactions />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/contas"
        element={
          <PrivateRoute>
            <Layout>
              <Accounts />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/categorias"
        element={
          <PrivateRoute>
            <Layout>
              <Categories />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
