import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import { StoreProvider } from './context/StoreContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Products from './pages/Products';
import POS from './pages/POS';
import Inventory from './pages/Inventory';
import Customers from './pages/Customers';
import Settings from './pages/Settings';
import Users from './pages/Users';
import Branches from './pages/Branches';
import Providers from './pages/Providers';
import Transfers from './pages/Transfers';
import Sales from './pages/Sales';
import Finances from './pages/Finances';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <StoreProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/pos" element={<POS />} />
                  <Route path="/inventory" element={<Inventory />} />
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/users" element={<Users />} />
                  <Route path="/branches" element={<Branches />} />
                  <Route path="/providers" element={<Providers />} />
                  <Route path="/transfers" element={<Transfers />} />
                  <Route path="/sales" element={<Sales />} />
                  <Route path="/finances" element={<Finances />} />
                  <Route path="/reports" element={<Reports />} />
                </Routes>
              </Layout>
            </ProtectedRoute>
          } />
        </Routes>
      </StoreProvider>
    </Router>
  );
}

export default App;
