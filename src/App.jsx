import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Package,
  Search,
  Download,
  LogOut,
  Plus,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  X,
} from 'lucide-react';
import { supabase } from './supabaseClient';

const LOCAL_CACHE_KEYS = {
  PRODUCTS: 'vizo_web_products_cache_v1',
  MOVEMENTS: 'vizo_web_movements_cache_v1',
};

const formatPEN = (val) => `S/ ${Number(val || 0).toFixed(2)}`;

const formatSimpleDate = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

// ============================================================================
// 1. PÁGINA DE LOGIN MINIMALISTA Y SIMPLE
// ============================================================================

function AuthScreen({ onSessionEstablished }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [infoMsg, setInfoMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setInfoMsg(null);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data?.session) onSessionEstablished(data.session);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        if (data?.session) {
          onSessionEstablished(data.session);
        } else {
          setInfoMsg('Cuenta creada. Ya puedes iniciar sesión.');
          setMode('login');
        }
      }
    } catch (err) {
      setErrorMsg(
        err.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos.'
          : err.message || 'No se pudo iniciar sesión.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-6">
        {/* Marca limpia */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-white text-black font-bold text-lg mb-2">
            V
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Vizo
          </h1>
          <p className="text-sm text-zinc-400">
            Inventario sincronizado en tiempo real
          </p>
        </div>

        {/* Selector simple: Iniciar sesión / Crear cuenta */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800/80 text-xs font-medium">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`h-9 rounded-lg transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Iniciar sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setInfoMsg(null);
            }}
            className={`h-9 rounded-lg transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Crear cuenta
          </button>
        </div>

        {/* Formulario limpio */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <input
            type="email"
            required
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-zinc-500 focus:outline-none text-sm text-white placeholder:text-zinc-500 transition-colors"
          />

          <input
            type="password"
            required
            minLength={6}
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full h-12 px-4 rounded-xl bg-zinc-900/90 border border-zinc-800 focus:border-zinc-500 focus:outline-none text-sm text-white placeholder:text-zinc-500 transition-colors"
          />

          {errorMsg && (
            <p className="text-xs text-red-400 text-center px-1">{errorMsg}</p>
          )}

          {infoMsg && (
            <p className="text-xs text-emerald-400 text-center px-1">{infoMsg}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-semibold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{mode === 'login' ? 'Entrar' : 'Crear cuenta'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 2. MODAL SIMPLE PARA AGREGAR PRODUCTO DESDE LA WEB
// ============================================================================

function NewProductModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [sellPrice, setSellPrice] = useState('');
  const [stock, setStock] = useState('1');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onCreate({
        name: name.trim(),
        costPrice: parseFloat(costPrice) || 0,
        sellPrice: parseFloat(sellPrice) || 0,
        stock: Math.max(0, parseInt(stock, 10) || 0),
      });
      setName('');
      setCostPrice('');
      setSellPrice('');
      setStock('1');
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#121215] border border-zinc-800 rounded-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white">Nuevo producto</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Nombre</label>
            <input
              type="text"
              required
              placeholder="Ej. Cinta aislante 3M"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none text-sm text-white placeholder:text-zinc-600"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Costo (S/)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none text-sm font-mono text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-zinc-400 mb-1">Precio venta (S/)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={sellPrice}
                onChange={(e) => setSellPrice(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none text-sm font-mono text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">Stock inicial</label>
            <input
              type="number"
              min="0"
              value={stock}
              onFocus={(e) => e.target.select()}
              onChange={(e) => setStock(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-zinc-500 focus:outline-none text-sm font-mono text-white"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full h-11 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-semibold text-sm transition-colors cursor-pointer mt-2"
          >
            {saving ? 'Guardando...' : 'Guardar producto'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// 3. PANEL WEB MINIMALISTA Y FÁCIL DE USAR
// ============================================================================

export default function App() {
  const [session, setSession] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);

  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'history'
  const [products, setProducts] = useState([]);
  const [movements, setMovements] = useState([]);
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [onlyLowStock, setOnlyLowStock] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data?.session || null);
      setAuthChecking(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const onOnline = () => setIsOnline(true);
    const onOffline = () => setIsOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const normalizeProduct = (raw) => ({
    id: raw.id,
    name: raw.name || 'Sin nombre',
    costPrice: Number(raw.cost_price ?? raw.costPrice ?? 0),
    sellPrice: Number(raw.sell_price ?? raw.sellPrice ?? 0),
    stock: Number(raw.stock ?? 0),
    photos: Array.isArray(raw.photos) ? raw.photos : [],
    updatedAt: raw.updated_at || raw.created_at || new Date().toISOString(),
  });

  const normalizeMovement = (raw) => ({
    id: raw.id || `mov-${Math.random()}`,
    productId: raw.product_id,
    productName: raw.products?.name || raw.product_name || 'Producto',
    type: raw.type === 'SALIDA' ? 'SALIDA' : 'ENTRADA',
    quantity: Math.abs(Number(raw.quantity ?? 0)),
    createdAt: raw.created_at || new Date().toISOString(),
  });

  const fetchDashboardData = useCallback(async () => {
    if (!session) return;

    try {
      const [prodRes, movRes] = await Promise.all([
        supabase.from('products').select('*').order('updated_at', { ascending: false }),
        supabase
          .from('inventory_movements')
          .select('*, products(name)')
          .order('created_at', { ascending: false })
          .limit(100),
      ]);

      if (!prodRes.error && Array.isArray(prodRes.data)) {
        const mappedProds = prodRes.data.map(normalizeProduct);
        setProducts(mappedProds);
        localStorage.setItem(LOCAL_CACHE_KEYS.PRODUCTS, JSON.stringify(mappedProds));
      }

      if (!movRes.error && Array.isArray(movRes.data)) {
        const mappedMovs = movRes.data.map(normalizeMovement);
        setMovements(mappedMovs);
        localStorage.setItem(LOCAL_CACHE_KEYS.MOVEMENTS, JSON.stringify(mappedMovs));
      }
    } catch {
      // Si no hay red, lee caché local
      try {
        setProducts(JSON.parse(localStorage.getItem(LOCAL_CACHE_KEYS.PRODUCTS) || '[]'));
        setMovements(JSON.parse(localStorage.getItem(LOCAL_CACHE_KEYS.MOVEMENTS) || '[]'));
      } catch {
        // Ignorar
      }
    }
  }, [session]);

  useEffect(() => {
    if (!session) return;
    fetchDashboardData();

    const channel = supabase
      .channel('web-dashboard-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => fetchDashboardData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventory_movements' },
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session, fetchDashboardData]);

  // Ajuste directo con un clic (-1 / +1)
  const handleAdjustStock = async (product, signedDelta) => {
    const nextStock = Math.max(0, product.stock + signedDelta);
    const nowIso = new Date().toISOString();
    const movType = signedDelta > 0 ? 'ENTRADA' : 'SALIDA';

    setProducts((prev) =>
      prev.map((p) =>
        p.id === product.id ? { ...p, stock: nextStock, updatedAt: nowIso } : p
      )
    );

    try {
      await supabase.rpc('increment_stock', {
        p_id: product.id,
        p_delta: signedDelta,
        p_type: movType,
      });
    } catch {
      // Sincroniza en la siguiente recarga
    }
  };

  // Crear producto desde la web
  const handleCreateProduct = async ({ name, costPrice, sellPrice, stock }) => {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from('products')
      .insert({
        name,
        cost_price: costPrice,
        sell_price: sellPrice,
        stock,
        photos: [],
        updated_at: nowIso,
      })
      .select()
      .single();

    if (!error && data) {
      if (stock > 0) {
        await supabase.from('inventory_movements').insert({
          product_id: data.id,
          type: 'ENTRADA',
          quantity: stock,
          created_at: nowIso,
        });
      }
      fetchDashboardData();
    }
  };

  const stats = useMemo(() => {
    const totalUnits = products.reduce((acc, p) => acc + p.stock, 0);
    const totalValue = products.reduce(
      (acc, p) => acc + p.stock * (p.sellPrice || p.costPrice),
      0
    );
    const lowStockCount = products.filter((p) => p.stock < 5).length;
    return { totalProducts: products.length, totalUnits, totalValue, lowStockCount };
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return products.filter((p) => {
      const matchesName = !q || p.name.toLowerCase().includes(q);
      const matchesLow = !onlyLowStock || p.stock < 5;
      return matchesName && matchesLow;
    });
  }, [products, searchQuery, onlyLowStock]);

  const handleExportCSV = () => {
    const headers = ['Producto', 'Costo (S/)', 'Precio Venta (S/)', 'Stock', 'Actualizado'];
    const rows = filteredProducts.map((p) => [
      `"${p.name.replace(/"/g, '""')}"`,
      p.costPrice.toFixed(2),
      p.sellPrice.toFixed(2),
      p.stock,
      `"${formatSimpleDate(p.updatedAt)}"`,
    ]);

    const csv = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `vizo-inventario-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-500 flex items-center justify-center text-sm">
        Cargando...
      </div>
    );
  }

  if (!session) {
    return <AuthScreen onSessionEstablished={setSession} />;
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col">
      {/* BARRA SUPERIOR SIMPLE Y LIMPIA */}
      <header className="sticky top-0 z-30 h-16 bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-800/80 px-6">
        <div className="max-w-5xl mx-auto h-full flex items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isOnline
                    ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]'
                    : 'bg-red-500 shadow-[0_0_8px_#ef4444]'
                }`}
                title={isOnline ? 'Sincronizado en línea' : 'Sin conexión'}
              />
              <span className="font-semibold text-base tracking-tight text-white">
                Vizo
              </span>
            </div>

            <nav className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800/80 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('inventory')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'inventory'
                    ? 'bg-white text-black font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Inventario
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'history'
                    ? 'bg-white text-black font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Historial
              </button>
            </nav>
          </div>

          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            className="h-9 px-3 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL CENTRADO Y DESPEJADO */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8 space-y-6">
        {/* Resumen en 3 tarjetas limpias */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-4">
            <span className="text-xs text-zinc-400">Productos</span>
            <div className="text-2xl font-mono font-bold text-white mt-1">
              {stats.totalProducts}
            </div>
          </div>

          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-4">
            <span className="text-xs text-zinc-400">Unidades en stock</span>
            <div className="text-2xl font-mono font-bold text-white mt-1">
              {stats.totalUnits}
            </div>
          </div>

          <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl p-4">
            <span className="text-xs text-zinc-400">Valor del inventario</span>
            <div className="text-2xl font-mono font-bold text-emerald-400 mt-1">
              {formatPEN(stats.totalValue)}
            </div>
          </div>
        </section>

        {/* VISTA 1: INVENTARIO */}
        {activeTab === 'inventory' && (
          <section className="space-y-4">
            {/* Barra de herramientas simple */}
            <div className="flex flex-wrap items-center justify-between gap-2.5">
              <div className="flex items-center gap-2 flex-1 min-w-[240px]">
                <div className="relative flex-1 max-w-sm">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar producto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#121215] border border-zinc-800/80 focus:border-zinc-600 focus:outline-none text-sm text-white placeholder:text-zinc-500"
                  />
                </div>

                {stats.lowStockCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setOnlyLowStock((prev) => !prev)}
                    className={`h-10 px-3 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                      onlyLowStock
                        ? 'bg-red-500/15 border-red-500/40 text-red-300'
                        : 'bg-[#121215] border-zinc-800/80 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    Stock bajo ({stats.lowStockCount})
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {products.length > 0 && (
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="h-10 px-3.5 rounded-xl bg-[#121215] hover:bg-zinc-800 border border-zinc-800/80 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar CSV</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowNewModal(true)}
                  className="h-10 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo producto</span>
                </button>
              </div>
            </div>

            {/* Lista / Tabla minimalista de productos */}
            {filteredProducts.length === 0 ? (
              <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl py-16 text-center space-y-2">
                <Package className="w-8 h-8 text-zinc-600 mx-auto" />
                <p className="text-sm text-zinc-400">
                  {products.length === 0
                    ? 'Aún no hay productos registrados.'
                    : 'No se encontraron coincidencias.'}
                </p>
              </div>
            ) : (
              <div className="bg-[#121215] border border-zinc-800/80 rounded-2xl divide-y divide-zinc-800/70 overflow-hidden">
                {filteredProducts.map((item) => {
                  const isLow = item.stock < 5;
                  return (
                    <div
                      key={item.id}
                      className="p-4 flex items-center justify-between gap-4 hover:bg-white/[0.01] transition-colors"
                    >
                      {/* Foto + Nombre + Precios */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {item.photos?.[0] ? (
                          <img
                            src={item.photos[0]}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover bg-zinc-900 border border-zinc-800 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                            <Package className="w-5 h-5" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-white truncate">
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-400 mt-0.5">
                            <span>Venta: {formatPEN(item.sellPrice)}</span>
                            <span className="text-zinc-700">·</span>
                            <span>Costo: {formatPEN(item.costPrice)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Control directo de stock: [ - ] Stock [ + ] */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          disabled={item.stock <= 0}
                          onClick={() => handleAdjustStock(item, -1)}
                          aria-label="Restar 1"
                          className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-800 text-zinc-300 flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>

                        <div
                          className={`min-w-[52px] h-9 px-2.5 rounded-xl font-mono font-bold text-base flex items-center justify-center border ${
                            isLow
                              ? 'bg-red-500/10 border-red-500/30 text-red-400'
                              : 'bg-zinc-900 border-zinc-800 text-white'
                          }`}
                        >
                          {item.stock}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleAdjustStock(item, 1)}
                          aria-label="Sumar 1"
                          className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 flex items-center justify-center cursor-pointer transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* VISTA 2: HISTORIAL DE MOVIMIENTOS */}
        {activeTab === 'history' && (
          <section className="bg-[#121215] border border-zinc-800/80 rounded-2xl overflow-hidden">
            {movements.length === 0 ? (
              <div className="py-16 text-center text-sm text-zinc-500">
                Aún no hay movimientos registrados.
              </div>
            ) : (
              <div className="divide-y divide-zinc-800/70">
                {movements.map((mov) => {
                  const isEntry = mov.type === 'ENTRADA';
                  return (
                    <div
                      key={mov.id}
                      className="p-4 flex items-center justify-between gap-4 text-sm"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                            isEntry
                              ? 'bg-emerald-500/15 text-emerald-400'
                              : 'bg-red-500/15 text-red-400'
                          }`}
                        >
                          {isEntry ? (
                            <ArrowDownRight className="w-4 h-4" />
                          ) : (
                            <ArrowUpRight className="w-4 h-4" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-white truncate">
                            {mov.productName}
                          </div>
                          <div className="text-xs text-zinc-500">
                            {formatSimpleDate(mov.createdAt)}
                          </div>
                        </div>
                      </div>

                      <span
                        className={`font-mono font-bold text-base ${
                          isEntry ? 'text-emerald-400' : 'text-red-400'
                        }`}
                      >
                        {isEntry ? `+${mov.quantity}` : `-${mov.quantity}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>

      <NewProductModal
        open={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreate={handleCreateProduct}
      />
    </div>
  );
}
