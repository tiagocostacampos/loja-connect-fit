
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Product, Sale, Expense, UserRole, Category } from './types';
import { INITIAL_PRODUCTS, INITIAL_SALES, INITIAL_EXPENSES, CATEGORIES, SIZES, COLORS } from './constants';
import { ShoppingBag, LayoutDashboard, Plus, Search, MessageCircle, BarChart3, Trash2, LogoIcon, FileDown, Send } from './components/Icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getFinancialInsights } from './geminiService';

// Chaves para o LocalStorage (Nosso "Banco de Dados")
const DB_KEYS = {
  PRODUCTS: 'connectfit_products',
  SALES: 'connectfit_sales',
  EXPENSES: 'connectfit_expenses',
};

// Componente de Card de Produto com suporte a múltiplas imagens
const ProductCard: React.FC<{ product: Product; role: UserRole }> = ({ product, role }) => {
  const [currentImg, setCurrentImg] = useState(0);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev + 1) % product.images.length);
  };

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg((prev) => (prev - 1 + product.images.length) % product.images.length);
  };

  return (
    <>
      <div className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-sm relative group flex flex-col h-full">
        {/* Badge de Promoção */}
        {product.isOnPromotion && (
          <div className="absolute top-3 left-3 z-30 bg-rose-500 text-white text-[8px] font-black px-2.5 py-1 rounded-full shadow-lg animate-pulse">
            PROMO
          </div>
        )}

        {/* Contêiner da Imagem com Proporção Fixa */}
        <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden cursor-pointer" onClick={() => setIsDetailsOpen(true)}>
          <img 
            src={product.images[currentImg]} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          
          {/* Navegação entre fotos */}
          {product.images.length > 1 && (
            <>
              <button onClick={prevImg} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-1.5 rounded-full text-white transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button onClick={nextImg} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-md p-1.5 rounded-full text-white transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"/></svg>
              </button>
              
              {/* Indicadores de Paginação */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1">
                {product.images.map((_, i) => (
                  <div key={i} className={`h-1 rounded-full transition-all ${i === currentImg ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`} />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Informações do Produto */}
        <div className="p-4 flex-1 flex flex-col">
          <p className="text-[9px] uppercase font-black text-emerald-600 tracking-wider mb-1">{product.category}</p>
          <h3 className="text-sm font-bold text-slate-800 line-clamp-2 leading-tight mb-2 flex-1">{product.name}</h3>
          
          <div className="flex flex-col">
            {product.isOnPromotion && product.promotionPrice ? (
              <>
                <span className="text-[10px] text-slate-300 line-through font-bold">R$ {product.price.toFixed(2)}</span>
                <span className="text-rose-600 font-black text-base">R$ {product.promotionPrice.toFixed(2)}</span>
              </>
            ) : (
              <span className="text-emerald-700 font-black text-base">R$ {product.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Modal de Detalhes do Produto */}
      {isDetailsOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm z-[150] flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <button onClick={() => setIsDetailsOpen(false)} className="absolute top-6 right-6 z-50 bg-white/20 backdrop-blur-md text-white p-2 rounded-full hover:bg-rose-500 transition-colors">✕</button>
            
            <div className="max-h-[85vh] overflow-y-auto no-scrollbar">
              <div className="aspect-[3/4] relative bg-slate-100">
                <img src={product.images[currentImg]} className="w-full h-full object-cover" />
              </div>
              <div className="p-8">
                <p className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-2">{product.category}</p>
                <h2 className="text-2xl font-black text-slate-800 leading-tight mb-4">{product.name}</h2>
                <div className="flex items-center gap-4 mb-6">
                  {product.isOnPromotion ? (
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-300 line-through font-bold">De R$ {product.price.toFixed(2)}</span>
                      <span className="text-2xl font-black text-rose-600">Por R$ {product.promotionPrice?.toFixed(2)}</span>
                    </div>
                  ) : <span className="text-2xl font-black text-emerald-700">R$ {product.price.toFixed(2)}</span>}
                  <div className="bg-slate-100 px-4 py-2 rounded-2xl">
                    <span className="text-[10px] font-black uppercase text-slate-500">Estoque: {product.stock} un</span>
                  </div>
                </div>
                <div className="space-y-4 text-slate-500 text-sm leading-relaxed mb-8">
                   <p className="font-bold text-slate-700 uppercase text-[10px] tracking-widest">Descrição do Produto</p>
                   <p>{product.description}</p>
                </div>
                <button 
                  onClick={() => {
                    const msg = encodeURIComponent(`Olá! Tenho interesse no produto: ${product.name}`);
                    window.open(`https://wa.me/?text=${msg}`, '_blank');
                  }}
                  className="w-full bg-emerald-500 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" /> Comprar no WhatsApp
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const App: React.FC = () => {
  const [role, setRole] = useState<UserRole>('CLIENT');
  const [activeTab, setActiveTab] = useState<'catalog' | 'dashboard' | 'inventory' | 'finance'>('catalog');
  
  // Inicialização de Dados com Fallback (Banco de Dados Local)
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.PRODUCTS);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.SALES);
    return saved ? JSON.parse(saved) : INITIAL_SALES;
  });
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(DB_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // Persistência Automática
  useEffect(() => { localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem(DB_KEYS.SALES, JSON.stringify(sales)); }, [sales]);
  useEffect(() => { localStorage.setItem(DB_KEYS.EXPENSES, JSON.stringify(expenses)); }, [expenses]);

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<Category | 'Todos'>('Todos');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [tempImages, setTempImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isInsightLoading, setIsInsightLoading] = useState(false);
  const [aiInsight, setAiInsight] = useState('');

  const stats = useMemo(() => {
    const totalSales = sales.reduce((acc, s) => acc + s.amount, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    return { totalSales, totalExpenses, profit: totalSales - totalExpenses };
  }, [sales, expenses]);

  const chartData = useMemo(() => {
    const dataMap: Record<string, { date: string, sales: number, expenses: number }> = {};
    sales.forEach(s => {
      if (!dataMap[s.date]) dataMap[s.date] = { date: s.date, sales: 0, expenses: 0 };
      dataMap[s.date].sales += s.amount;
    });
    expenses.forEach(e => {
      if (!dataMap[e.date]) dataMap[e.date] = { date: e.date, sales: 0, expenses: 0 };
      dataMap[e.date].expenses += e.amount;
    });
    return Object.values(dataMap).sort((a, b) => a.date.localeCompare(b.date));
  }, [sales, expenses]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchCategory = filterCategory === 'Todos' || p.category === filterCategory;
      return matchSearch && matchCategory;
    });
  }, [products, search, filterCategory]);

  const handleExportBackup = () => {
    const data = { products, sales, expenses, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `connectfit_backup_${new Date().toLocaleDateString()}.json`;
    link.click();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.products) setProducts(data.products);
        if (data.sales) setSales(data.sales);
        if (data.expenses) setExpenses(data.expenses);
        alert('Backup restaurado com sucesso!');
      } catch (err) {
        alert('Erro ao ler arquivo de backup.');
      }
    };
    reader.readAsText(file);
  };

  const handleAuthToggle = () => {
    if (role === 'ADM') { setRole('CLIENT'); setActiveTab('catalog'); }
    else { setIsLoginModalOpen(true); setPasscode(''); setLoginError(false); }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234') { setRole('ADM'); setIsLoginModalOpen(false); setActiveTab('dashboard'); }
    else setLoginError(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      const file = files.item(i);
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') setTempImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAddProduct = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newProduct: Product = {
      id: editingProduct?.id || Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      category: formData.get('category') as Category,
      price: parseFloat(formData.get('price') as string),
      purchasePrice: parseFloat(formData.get('purchasePrice') as string),
      promotionPrice: formData.get('promotionPrice') ? parseFloat(formData.get('promotionPrice') as string) : undefined,
      isOnPromotion: formData.get('isOnPromotion') === 'on',
      sizes: SIZES,
      colors: COLORS,
      stock: parseInt(formData.get('stock') as string),
      images: tempImages.length > 0 ? tempImages : ['https://via.placeholder.com/400x600?text=Sem+Imagem'],
      description: (formData.get('description') as string) || "Produto fitness Connect Fit.",
    };
    if (editingProduct) setProducts(products.map(p => p.id === editingProduct.id ? newProduct : p));
    else setProducts([...products, newProduct]);
    setIsProductModalOpen(false);
    setTempImages([]);
  };

  const handleRegisterSale = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const productId = formData.get('productId') as string;
    const quantity = parseInt(formData.get('quantity') as string);
    const product = products.find(p => p.id === productId);
    if (product && product.stock >= quantity) {
      const finalPrice = (product.isOnPromotion && product.promotionPrice) ? product.promotionPrice : product.price;
      const newSale: Sale = {
        id: Math.random().toString(36).substr(2, 9),
        productId,
        productName: product.name,
        quantity,
        amount: finalPrice * quantity,
        date: new Date().toISOString().split('T')[0],
      };
      setSales([...sales, newSale]);
      setProducts(products.map(p => p.id === productId ? { ...p, stock: p.stock - quantity } : p));
      setIsSaleModalOpen(false);
    } else alert("Estoque insuficiente!");
  };

  const handleRegisterExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      description: formData.get('description') as string,
      amount: parseFloat(formData.get('amount') as string),
      category: formData.get('category') as string,
      date: formData.get('date') as string,
    };
    setExpenses([...expenses, newExpense]);
    setIsExpenseModalOpen(false);
  };

  const fetchAiInsights = async () => {
    setIsInsightLoading(true);
    const result = await getFinancialInsights(sales, expenses);
    setAiInsight(result || 'Nenhum insight disponível.');
    setIsInsightLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-28 text-slate-900">
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-slate-200 z-50 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500 p-2 rounded-xl shadow-sm"><LogoIcon className="text-white w-5 h-5" /></div>
          <h1 className="text-xl font-black text-slate-800 italic">Connect<span className="text-emerald-500">Fit</span></h1>
        </div>
        <button onClick={handleAuthToggle} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${role === 'ADM' ? 'bg-rose-500 border-rose-500 text-white' : 'bg-slate-900 border-slate-900 text-white'}`}>
          {role === 'ADM' ? 'Sair do ADM' : 'Administrador'}
        </button>
      </header>

      <main className="pt-20 px-4 max-w-4xl mx-auto">
        {activeTab === 'catalog' && (
          <section className="animate-in fade-in duration-500">
            <div className="my-6 space-y-4">
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <input type="text" placeholder="Buscar no catálogo..." className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm font-medium" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button onClick={() => setFilterCategory('Todos')} className={`px-6 py-2 rounded-xl whitespace-nowrap text-xs font-bold uppercase border transition-all ${filterCategory === 'Todos' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500'}`}>Todos</button>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setFilterCategory(cat)} className={`px-6 py-2 rounded-xl whitespace-nowrap text-xs font-bold uppercase border transition-all ${filterCategory === cat ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-500'}`}>{cat}</button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map(product => <ProductCard key={product.id} product={product} role={role} />)}
            </div>
          </section>
        )}

        {role === 'ADM' && activeTab === 'dashboard' && (
          <section className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm text-center">
                <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Vendas</p>
                <p className="text-sm font-black">R$ {stats.totalSales.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm text-center">
                <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Gastos</p>
                <p className="text-sm font-black text-rose-500">R$ {stats.totalExpenses.toFixed(2)}</p>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm text-center">
                <p className="text-[9px] text-slate-400 font-black uppercase mb-1">Lucro</p>
                <p className={`text-sm font-black ${stats.profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>R$ {stats.profit.toFixed(2)}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm h-72">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: '15px', border: 'none' }} />
                    <Bar dataKey="sales" fill="#10b981" radius={[4, 4, 0, 0]} name="Entradas" />
                    <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Saídas" />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="bg-slate-900 p-6 rounded-[2.5rem] text-white shadow-xl">
               <div className="flex items-center justify-between mb-2">
                 <h3 className="text-[10px] font-black uppercase tracking-widest">IA Insight</h3>
                 <button onClick={fetchAiInsights} className="text-[9px] bg-white/10 px-3 py-1.5 rounded-full font-bold uppercase">{isInsightLoading ? 'Carregando...' : 'Analisar'}</button>
               </div>
               <p className="text-xs text-slate-300 italic">{aiInsight || 'Solicite uma análise dos dados atuais.'}</p>
            </div>
          </section>
        )}

        {role === 'ADM' && activeTab === 'inventory' && (
          <section className="space-y-4 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-black uppercase tracking-widest">Controle de Estoque</h2>
              <button onClick={() => { setEditingProduct(null); setTempImages([]); setIsProductModalOpen(true); }} className="bg-emerald-500 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase shadow-lg shadow-emerald-500/20 flex items-center gap-2"><Plus className="w-4 h-4" /> Novo</button>
            </div>
            <div className="space-y-3">
              {products.map(p => (
                <div key={p.id} className="bg-white p-3 rounded-2xl border border-slate-100 flex items-center gap-4 shadow-sm">
                  <img src={p.images[0]} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="font-bold text-xs">{p.name}</h4>
                    <p className="text-[9px] text-slate-400 font-black uppercase">ESTOQUE: {p.stock} | CUSTO: R$ {p.purchasePrice.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingProduct(p); setTempImages(p.images); setIsProductModalOpen(true); }} className="p-2 text-slate-400 hover:text-emerald-500"><Plus className="w-5 h-5" /></button>
                    <button onClick={() => setProducts(products.filter(item => item.id !== p.id))} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 className="w-5 h-5" /></button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {role === 'ADM' && activeTab === 'finance' && (
          <section className="space-y-6 animate-in fade-in duration-500">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setIsSaleModalOpen(true)} className="bg-emerald-500 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg">Registrar Venda</button>
              <button onClick={() => setIsExpenseModalOpen(true)} className="bg-slate-900 text-white py-4 rounded-2xl font-black text-[10px] uppercase shadow-lg">Registrar Gasto</button>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Banco de Dados & Backup</h3>
              <div className="flex gap-4">
                <button onClick={handleExportBackup} className="flex-1 flex items-center justify-center gap-2 bg-slate-50 py-3 rounded-xl text-[10px] font-black uppercase text-slate-600 hover:bg-slate-100 transition-colors">
                  <FileDown className="w-4 h-4" /> Exportar Dados
                </button>
                <label className="flex-1 flex items-center justify-center gap-2 bg-slate-50 py-3 rounded-xl text-[10px] font-black uppercase text-slate-600 cursor-pointer hover:bg-slate-100 transition-colors">
                  <Send className="w-4 h-4" /> Importar Backup
                  <input type="file" className="hidden" accept=".json" onChange={handleImportBackup} />
                </label>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 p-6 shadow-sm">
              <h3 className="text-[10px] font-black text-slate-400 uppercase mb-4 tracking-widest">Histórico Financeiro</h3>
              <div className="space-y-4">
                {[...sales, ...expenses.map(e => ({...e, isExpense: true}))].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10).map((item: any) => (
                    <div key={item.id} className="flex items-center justify-between border-b border-slate-50 pb-2">
                      <div>
                        <p className="text-xs font-bold">{item.productName || item.description}</p>
                        <p className="text-[9px] text-slate-400 font-bold uppercase">{item.date}</p>
                      </div>
                      <span className={`text-xs font-black ${item.isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>{item.isExpense ? '-' : '+'} R$ {item.amount.toFixed(2)}</span>
                    </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-50 px-4 py-3 flex items-center justify-around shadow-lg">
        <button onClick={() => setActiveTab('catalog')} className={`flex flex-col items-center gap-1 ${activeTab === 'catalog' ? 'text-emerald-500' : 'text-slate-400'}`}>
          <ShoppingBag className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Loja</span>
        </button>
        {role === 'ADM' && (
          <>
            <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-emerald-500' : 'text-slate-400'}`}>
              <LayoutDashboard className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Dash</span>
            </button>
            <button onClick={() => setActiveTab('inventory')} className={`flex flex-col items-center gap-1 ${activeTab === 'inventory' ? 'text-emerald-500' : 'text-slate-400'}`}>
              <Plus className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Stock</span>
            </button>
            <button onClick={() => setActiveTab('finance')} className={`flex flex-col items-center gap-1 ${activeTab === 'finance' ? 'text-emerald-500' : 'text-slate-400'}`}>
              <BarChart3 className="w-6 h-6" /><span className="text-[9px] font-black uppercase">Dinheiro</span>
            </button>
          </>
        )}
      </nav>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-10 shadow-2xl">
            <h2 className="text-2xl font-black text-slate-800 uppercase text-center mb-8">Acesso ADM</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <input type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)} placeholder="••••" className="w-full text-center text-2xl tracking-[0.5em] px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-black" autoFocus />
              {loginError && <p className="text-rose-500 text-[10px] font-black uppercase text-center font-bold">Acesso Negado</p>}
              <button type="submit" className="w-full bg-emerald-500 text-white py-5 rounded-[2rem] font-black text-xs uppercase shadow-xl">Entrar</button>
              <button type="button" onClick={() => setIsLoginModalOpen(false)} className="w-full text-slate-400 font-bold py-2 text-[10px] uppercase text-center">Cancelar</button>
            </form>
          </div>
        </div>
      )}

      {/* Product Modal - ATUALIZADO COM PROMOÇÕES */}
      {isProductModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 overflow-y-auto max-h-[95vh] shadow-2xl">
            <h2 className="text-xl font-black text-slate-800 uppercase mb-8">{editingProduct ? 'Editar' : 'Novo'} Produto</h2>
            <form onSubmit={handleAddProduct} className="space-y-6">
              <input name="name" defaultValue={editingProduct?.name} required placeholder="Nome do Produto" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              
              <div className="space-y-4">
                <div onClick={() => fileInputRef.current?.click()} className="w-full py-8 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 transition-colors">
                  <Plus className="w-8 h-8 text-slate-300 mb-2" />
                  <span className="text-[10px] font-black text-slate-400 uppercase">Selecionar Fotos</span>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleFileChange} />
                </div>
                {tempImages.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {tempImages.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                        <img src={img} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setTempImages(tempImages.filter((_, i) => i !== idx))} className="absolute inset-0 bg-rose-500/80 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* GRID DE PREÇOS E PROMOÇÃO */}
              <div className="bg-slate-50 p-6 rounded-[2rem] space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Custo (Privado)</label>
                    <input name="purchasePrice" type="number" step="0.01" defaultValue={editingProduct?.purchasePrice} required placeholder="Custo R$" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Preço de Venda</label>
                    <input name="price" type="number" step="0.01" defaultValue={editingProduct?.price} required placeholder="Venda R$" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-400 ml-1">Preço Promo (Opcional)</label>
                    <input name="promotionPrice" type="number" step="0.01" defaultValue={editingProduct?.promotionPrice} placeholder="R$ 0,00" className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-rose-500" />
                  </div>
                  <div className="flex flex-col justify-center items-center gap-1 pt-4">
                    <span className="text-[9px] font-black uppercase text-slate-400">Ativar Promoção?</span>
                    <input type="checkbox" name="isOnPromotion" defaultChecked={editingProduct?.isOnPromotion} className="w-6 h-6 accent-emerald-500 rounded-lg cursor-pointer" />
                  </div>
                </div>
              </div>

              <textarea name="description" defaultValue={editingProduct?.description} placeholder="Descrição detalhada do produto..." className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-medium text-sm min-h-[100px]" />
              
              <div className="grid grid-cols-2 gap-4">
                <select name="category" defaultValue={editingProduct?.category} className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input name="stock" type="number" defaultValue={editingProduct?.stock || 1} required placeholder="Estoque" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              </div>
              
              <button type="submit" className="w-full bg-emerald-500 text-white py-5 rounded-[2rem] font-black text-xs uppercase shadow-xl tracking-widest active:scale-[0.98] transition-all">Salvar Produto</button>
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase text-center tracking-widest">Sair</button>
            </form>
          </div>
        </div>
      )}

      {/* Sale Modal */}
      {isSaleModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-xl font-black text-slate-800 uppercase mb-8 text-center">Venda Manual</h2>
            <form onSubmit={handleRegisterSale} className="space-y-6">
              <select name="productId" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold">
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <input name="quantity" type="number" defaultValue="1" min="1" required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              <button type="submit" className="w-full bg-emerald-500 text-white py-5 rounded-[2rem] font-black text-xs uppercase shadow-xl">Confirmar</button>
              <button type="button" onClick={() => setIsSaleModalOpen(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase text-center font-bold">Voltar</button>
            </form>
          </div>
        </div>
      )}

      {isExpenseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-xl font-black text-slate-800 uppercase mb-8 text-center font-bold">Novo Gasto</h2>
            <form onSubmit={handleRegisterExpense} className="space-y-6">
              <input name="description" required placeholder="Ex: Aluguel" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              <input name="amount" type="number" step="0.01" required placeholder="Valor R$" className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              <input name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black text-xs uppercase shadow-xl">Salvar</button>
              <button type="button" onClick={() => setIsExpenseModalOpen(false)} className="w-full text-slate-400 font-bold text-[10px] uppercase text-center font-bold">Sair</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
