import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Customers from './components/Customers';
import Orders from './components/Orders';

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 selection:bg-rose-100 selection:text-rose-900">
      <Navbar />
      <main className="flex-grow container mx-auto px-6 py-10 max-w-7xl relative">
        {/* Subtle background glow effects */}
        <div className="fixed top-20 left-10 w-96 h-96 bg-rose-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
        <div className="fixed top-40 right-10 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 pointer-events-none"></div>
        
        <div className="relative z-10">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default App;
