import { useState, useEffect } from 'react';
import { Package, Users, ShoppingCart, TrendingUp, Activity, AlertTriangle } from 'lucide-react';
import { productAPI, customerAPI, orderAPI } from '../services/api';
import { Link } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

const StatCard = ({ title, value, icon: Icon, gradient, linkTo, delay, growth }) => (
  <div className={`bg-white rounded-3xl p-6 border border-stone-200/50 shadow-sm card-hover-effect animate-fade-in`} style={{ animationDelay: `${delay}ms` }}>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3.5 rounded-2xl bg-gradient-to-br ${gradient} shadow-sm`}>
        <Icon size={24} className="text-white" strokeWidth={2.5} />
      </div>
      {growth && (
        <div className="px-2.5 py-1 bg-green-50 text-green-600 rounded-full text-xs font-bold tracking-wide">
          {growth}
        </div>
      )}
    </div>
    <div>
      <h3 className="text-4xl font-black text-stone-800 tracking-tight mb-1">{value}</h3>
      <p className="text-sm font-medium text-stone-300 uppercase tracking-wider">{title}</p>
    </div>
    <div className="mt-5 pt-5 border-t border-stone-200">
      <Link to={linkTo} className="text-sm font-bold text-rose-500 hover:text-indigo-800 flex items-center group">
        Explore Data 
        <TrendingUp size={16} className="ml-1.5 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 rounded-2xl shadow-xl border border-stone-200">
        <p className="text-stone-400 font-bold mb-1">{label}</p>
        <p className="text-rose-500 font-black text-lg">
          ${payload[0].value.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

const Dashboard = () => {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0, lowStock: 0 });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, customersRes, ordersRes] = await Promise.allSettled([
          productAPI.getAll(),
          customerAPI.getAll(),
          orderAPI.getAll()
        ]);

        if (ordersRes.status === 'fulfilled') {
          const orders = ordersRes.value.data;
          const revenue = orders.reduce((sum, order) => sum + order.total_amount, 0);
          
          const revenueByDate = orders.reduce((acc, order) => {
            if (order.created_at) {
              const date = new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              acc[date] = (acc[date] || 0) + order.total_amount;
            }
            return acc;
          }, {});

          const formattedChartData = Object.keys(revenueByDate).map(date => ({
            date,
            revenue: revenueByDate[date]
          }));
          
          if (formattedChartData.length === 0) {
            const today = format(new Date(), 'MMM dd');
            formattedChartData.push({ date: today, revenue: 0 });
          }

          setChartData(formattedChartData);
          setStats(prev => ({ ...prev, orders: orders.length, revenue: revenue.toFixed(2) }));
        }

        if (productsRes.status === 'fulfilled') {
          const products = productsRes.value.data;
          const lowStockCount = products.filter(p => p.stock <= 5).length;
          setStats(prev => ({ ...prev, products: products.length, lowStock: lowStockCount }));
        }

        if (customersRes.status === 'fulfilled') {
          setStats(prev => ({ ...prev, customers: customersRes.value.data.length }));
        }

      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="relative w-16 h-16">
          <div className="absolute inset-0 rounded-full border-t-4 border-rose-300 animate-spin opacity-80"></div>
          <div className="absolute inset-2 rounded-full border-r-4 border-fuchsia-500 animate-spin opacity-60 animation-delay-150"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black text-stone-800 tracking-tight">Overview</h1>
          <p className="text-stone-400 mt-2 font-medium">Welcome back! Here is your business at a glance.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm">
          <Activity size={18} className="text-orange-400" />
          <span className="text-sm font-bold text-stone-600">System Healthy</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard delay={0} title="Total Products" value={stats.products} icon={Package} gradient="from-blue-500 to-cyan-400" linkTo="/products" />
        <StatCard delay={100} title="Active Customers" value={stats.customers} icon={Users} gradient="from-emerald-400 to-teal-500" linkTo="/customers" />
        <StatCard delay={200} title="Completed Orders" value={stats.orders} icon={ShoppingCart} gradient="from-rose-300 to-orange-200" linkTo="/orders" />
        <StatCard delay={300} title="Low Stock Items" value={stats.lowStock} icon={AlertTriangle} gradient="from-rose-400 to-red-500" linkTo="/products" />
      </div>

      <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl border border-stone-200 shadow-sm p-8 card-hover-effect">
          <h2 className="text-xl font-bold mb-6 text-stone-800 flex items-center gap-2">
            <Activity className="text-rose-400" /> Revenue Over Time
          </h2>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 600}} tickFormatter={(value) => `$${value}`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl card-hover-effect">
          <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 rounded-full bg-rose-500 opacity-20 blur-2xl"></div>
          
          <h2 className="text-xl font-bold mb-2 relative z-10">Quick Actions</h2>
          <p className="text-indigo-200 text-sm mb-8 relative z-10">Accelerate your workflow with these shortcuts.</p>
          
          <div className="space-y-4 relative z-10">
            <Link to="/products" className="flex items-center gap-4 bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all backdrop-blur-md border border-white/10">
              <div className="p-2 bg-white/20 rounded-lg">
                <Package size={20} />
              </div>
              <span className="font-semibold tracking-wide">Add New Product</span>
            </Link>
            <Link to="/orders" className="flex items-center gap-4 bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all backdrop-blur-md border border-white/10">
              <div className="p-2 bg-white/20 rounded-lg">
                <ShoppingCart size={20} />
              </div>
              <span className="font-semibold tracking-wide">Draft New Order</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
