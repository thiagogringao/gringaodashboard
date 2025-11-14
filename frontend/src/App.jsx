import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Users from './pages/Users/Users';
import EcommerceCatalog from './pages/Ecommerce/EcommerceCatalog';
import LojaFisicaCatalog from './pages/LojaFisica/LojaFisicaCatalog';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import PicosQueda from './pages/PicosQueda/PicosQueda';
import SugestaoCompras from './pages/SugestaoCompras/SugestaoCompras';
import './App.css';

// Configurar React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutos
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <Routes>
            {/* Rotas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Rotas protegidas */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout>
                    <Home />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/ecommerce"
              element={
                <PrivateRoute>
                  <Layout>
                    <EcommerceCatalog />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/loja-fisica"
              element={
                <PrivateRoute>
                  <Layout>
                    <LojaFisicaCatalog />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/sugestao-compras"
              element={
                <PrivateRoute>
                  <Layout>
                    <SugestaoCompras />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/picos-queda"
              element={
                <PrivateRoute>
                  <Layout>
                    <PicosQueda />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/:tipo/:codigo"
              element={
                <PrivateRoute>
                  <Layout>
                    <ProductDetail />
                  </Layout>
                </PrivateRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <PrivateRoute>
                  <Layout>
                    <Users />
                  </Layout>
                </PrivateRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

export default App;
