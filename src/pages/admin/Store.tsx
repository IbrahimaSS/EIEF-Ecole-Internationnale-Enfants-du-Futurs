import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  Search,
  Plus,
  Package,
  AlertTriangle,
  ArrowRight,
  Eye,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  DollarSign,
  Briefcase,
  Layers,
  TrendingDown,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Table, Badge, Card, StatCard, Button, Modal, Input, Select, Popover } from '../../components/ui';
import { cn } from '../../utils/cn';
import {
  getAllProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  updateStock,
  createSale,
  ProductResponse,
  ProductRequest,
  SaleRequest,
} from '../../services/storeServices';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('fr-GN').format(amount) + ' FGN';

const EMPTY_PRODUCT_FORM: ProductRequest = {
  name: '',
  sku: '',
  category: '',
  price: 0,
  quantity: 0,
  alertThreshold: 5,
};

// ─── Component ───────────────────────────────────────────────────────────────

const AdminStore: React.FC = () => {
  // ── Data state ──
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── UI state ──
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('Opération accomplie !');

  // ── Add / Edit modal ──
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductResponse | null>(null);
  const [productForm, setProductForm] = useState<ProductRequest>(EMPTY_PRODUCT_FORM);
  const [formLoading, setFormLoading] = useState(false);

  // ── Sale modal ──
  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [saleProductId, setSaleProductId] = useState('');
  const [saleQty, setSaleQty] = useState(1);
  const [saleStudentId, setSaleStudentId] = useState('');
  const [saleLoading, setSaleLoading] = useState(false);

  // ── Delete confirm ──
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // ── Stock update ──
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockProductId, setStockProductId] = useState<string | null>(null);
  const [stockQty, setStockQty] = useState(0);
  const [stockLoading, setStockLoading] = useState(false);

  // ─── Fetch ──────────────────────────────────────────────────────────────────

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params: { category?: string; search?: string } = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      else if (activeCategory !== 'Tous') params.category = activeCategory;
      const data = await getAllProducts(params);
      setProducts(data);
    } catch (e: any) {
      setError(e.message || 'Erreur lors du chargement des produits.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeCategory]);

  // Debounce search + category changes
  useEffect(() => {
    const timer = setTimeout(fetchProducts, 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // ─── Derived KPIs ────────────────────────────────────────────────────────────

  const stockCritiqueCount = products.filter(p => p.lowStock && p.quantity > 0).length;
  const outOfStockCount = products.filter(p => p.quantity === 0).length;
  const totalStockValue = products.reduce((acc, p) => acc + p.price * p.quantity, 0);

  // All unique categories from server data
  const categories = ['Tous', ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  // ─── Success toast ───────────────────────────────────────────────────────────

  const showSuccess = (msg = 'Opération accomplie !') => {
    setSuccessMessage(msg);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 3500);
  };

  // ─── Add / Edit handlers ─────────────────────────────────────────────────────

  const openAddModal = () => {
    setEditingProduct(null);
    setProductForm(EMPTY_PRODUCT_FORM);
    setIsAddModalOpen(true);
  };

  const openEditModal = (product: ProductResponse) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      price: product.price,
      quantity: product.quantity,
      alertThreshold: product.alertThreshold,
    });
    setOpenMenuId(null);
    setIsAddModalOpen(true);
  };

  const handleProductFormChange = (field: keyof ProductRequest, value: string | number) => {
    setProductForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProduct = async () => {
    try {
      setFormLoading(true);
      if (editingProduct) {
        await updateProduct(editingProduct.id, productForm);
        showSuccess('Produit mis à jour avec succès !');
      } else {
        await addProduct(productForm);
        showSuccess("L'article a été ajouté au stock.");
      }
      setIsAddModalOpen(false);
      fetchProducts();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setFormLoading(false);
    }
  };

  // ─── Delete handlers ─────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      setDeleteLoading(true);
      await deleteProduct(deletingId);
      showSuccess('Article supprimé du stock.');
      setDeletingId(null);
      fetchProducts();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la suppression.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Stock update handlers ───────────────────────────────────────────────────

  const openStockModal = (product: ProductResponse) => {
    setStockProductId(product.id);
    setStockQty(product.quantity);
    setOpenMenuId(null);
    setStockModalOpen(true);
  };

  const handleUpdateStock = async () => {
    if (!stockProductId) return;
    try {
      setStockLoading(true);
      await updateStock(stockProductId, stockQty);
      showSuccess('Stock mis à jour.');
      setStockModalOpen(false);
      fetchProducts();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la mise à jour du stock.');
    } finally {
      setStockLoading(false);
    }
  };

  // ─── Sale handlers ───────────────────────────────────────────────────────────

  // Computed sale total
  const saleProduct = products.find(p => p.id === saleProductId);
  const saleTotalDisplay = saleProduct ? formatCurrency(saleProduct.price * saleQty) : '0 FGN';

  const handleCreateSale = async () => {
    if (!saleProductId) return;
    try {
      setSaleLoading(true);
      const payload: SaleRequest = {
        studentId: saleStudentId || null,
        items: [{ productId: saleProductId, quantity: saleQty }],
      };
      await createSale(payload);
      showSuccess('Vente enregistrée avec succès !');
      setIsSaleModalOpen(false);
      setSaleProductId('');
      setSaleQty(1);
      setSaleStudentId('');
      fetchProducts();
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la vente.');
    } finally {
      setSaleLoading(false);
    }
  };

  // ─── Table columns ───────────────────────────────────────────────────────────

  const columns = [
    {
      key: 'name',
      label: 'Article',
      sortable: true,
      render: (_: any, row: ProductResponse) => (
        <div className="flex items-center gap-4 py-1">
          <div className="p-2.5 rounded-2xl text-white shadow-lg transition-transform group-hover:scale-110 bg-gradient-to-br from-bleu-800 via-bleu-600 to-or-500 shadow-bleu-500/20">
            {row.category?.toLowerCase().includes('fournitures')
              ? <Package size={20} />
              : <Briefcase size={20} />}
          </div>
          <div className="text-left font-bold">
            <div className="font-bold text-gray-900 dark:text-white leading-tight mb-0.5 text-[13px]">{row.name}</div>
            <div className="text-[11px] text-gray-400 font-semibold italic">{row.sku}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Catégorie',
      sortable: true,
      render: (val: string) => (
        <Badge
          variant="default"
          className={cn(
            'text-[10px] font-bold px-3 py-1 border-none bg-opacity-10',
            val?.toLowerCase().includes('fournitures')
              ? 'bg-bleu-600 text-bleu-600'
              : 'bg-or-600 text-or-600'
          )}
        >
          {val}
        </Badge>
      ),
    },
    {
      key: 'price',
      label: 'Prix Unitaire',
      render: (val: number) => (
        <span className="font-bold text-gray-900 dark:text-white text-xs">{formatCurrency(val)}</span>
      ),
    },
    {
      key: 'quantity',
      label: 'État du Stock',
      render: (val: number, row: ProductResponse) => {
        const isCritical = row.lowStock && val > 0;
        const isOut = val === 0;
        const percentage = Math.min((val / Math.max(row.alertThreshold * 3, 1)) * 100, 100);
        return (
          <div className="flex flex-col gap-2 min-w-[120px] text-left">
            <div className="flex items-center justify-between font-bold">
              <span className={cn(
                'text-[11px]',
                isOut ? 'text-red-500' : isCritical ? 'text-orange-500' : 'text-green-500'
              )}>
                {val} <span className="text-[9px] opacity-60 font-medium lowercase">Unités</span>
              </span>
              <Badge
                variant={isOut ? 'error' : isCritical ? 'warning' : 'success'}
                className="text-[8px] px-2 h-5 border-none font-bold uppercase tracking-wider"
              >
                {isOut ? 'Rupture' : isCritical ? 'Critique' : 'Disponible'}
              </Badge>
            </div>
            <div className="w-full h-1.5 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                className={cn(
                  'h-full rounded-full transition-all duration-1000',
                  isOut
                    ? 'bg-red-500'
                    : isCritical
                    ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.3)]'
                    : 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                )}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'actions',
      label: '',
      render: (_: any, row: ProductResponse) => (
        <Popover
          isOpen={openMenuId === row.id}
          onClose={() => setOpenMenuId(null)}
          trigger={
            <button
              onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === row.id ? null : row.id); }}
              className="p-2.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition-all text-gray-400 group"
            >
              <ArrowRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          }
        >
          <div className="bg-white dark:bg-gray-900 rounded-[1.5rem] shadow-2xl border border-gray-100 dark:border-white/10 p-2.5 min-w-[220px] text-left">
            <div className="px-4 py-2 border-b border-gray-50 dark:border-white/5 mb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Options Article</p>
            </div>
            <button
              onClick={() => openStockModal(row)}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all"
            >
              <Eye size={16} className="text-bleu-600" /> Gérer le Stock
            </button>
            <button
              onClick={() => openEditModal(row)}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl transition-all"
            >
              <Edit size={16} className="text-or-600" /> Modifier
            </button>
            <div className="h-px bg-gray-50 dark:bg-white/5 my-2 mx-2" />
            <button
              onClick={() => { setDeletingId(row.id); setOpenMenuId(null); }}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/40 rounded-xl transition-all"
            >
              <Trash2 size={16} /> Supprimer du Stock
            </button>
          </div>
        </Popover>
      ),
    },
  ];

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
      onClick={() => setOpenMenuId(null)}
    >
      {/* ── HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-4 mb-2 text-left">
            <div className="p-3 bg-white dark:bg-white/5 rounded-2xl shadow-soft">
              <ShoppingBag className="text-bleu-600 dark:text-bleu-400" size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-bleu-or-text tracking-tight">Gestion de la Supérette</h1>
              <p className="text-gray-500 dark:text-gray-400 font-semibold text-sm">
                Inventaire des fournitures, tenues et accessoires scolaires
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsSaleModalOpen(true)}
            className="flex gap-2 dark:border-white/10 dark:text-white text-[12px] font-bold px-6 h-12 rounded-[1rem] shadow-sm"
          >
            <DollarSign size={18} /> Saisir une vente
          </Button>
          <Button
            onClick={openAddModal}
            className="flex gap-2 bg-gradient-to-r from-bleu-700 to-bleu-500 shadow-blue border-none font-bold text-[12px] h-12 px-8 rounded-[1rem] shadow-lg shadow-bleu-600/20"
          >
            <Plus size={20} /> Nouvel article
          </Button>
        </div>
      </div>

      {/* ── GLOBAL ERROR ── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800/30 rounded-2xl text-red-600 dark:text-red-400 text-sm font-semibold"
          >
            <AlertCircle size={18} className="shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 dark:hover:bg-red-800/30 rounded-full">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── KPI GRID ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Articles Référencés"
          value={loading ? '…' : products.length.toString()}
          subtitle="Catalogue complet"
          icon={<Layers />}
          color="bleu"
        />
        <StatCard
          title="Stock Critique"
          value={loading ? '…' : stockCritiqueCount.toString()}
          subtitle="Alertes réappro"
          icon={<AlertTriangle />}
          color="or"
          trend={{ value: 'Action requise', direction: 'down' }}
        />
        <StatCard
          title="Ruptures de Stock"
          value={loading ? '…' : outOfStockCount.toString()}
          subtitle="Disponibilité nulle"
          icon={<TrendingDown />}
          color="rouge"
        />
        <StatCard
          title="Valeur de Stock"
          value={loading ? '…' : formatCurrency(Math.round(totalStockValue))}
          subtitle="Total actifs"
          icon={<ShoppingBag />}
          color="vert"
        />
      </div>

      {/* ── FILTERS ── */}
      <Card className="p-4 bg-white dark:bg-gray-900/50 dark:backdrop-blur-md shadow-soft border-none relative overflow-visible">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex p-1 bg-gray-100 dark:bg-white/5 rounded-xl w-fit overflow-x-auto no-scrollbar max-w-full">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-300 whitespace-nowrap',
                  activeCategory === cat
                    ? 'bg-gradient-to-r from-bleu-700 to-bleu-500 text-white shadow-lg'
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Chercher une fourniture, tenue…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-bleu-500/10 transition-all font-bold text-gray-700 dark:text-white shadow-sm text-sm"
            />
          </div>
        </div>
      </Card>

      {/* ── PRODUCT TABLE ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeCategory}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Card className="p-0 border-none shadow-soft overflow-hidden dark:bg-gray-900/50 dark:backdrop-blur-md">
            {loading ? (
              <div className="flex items-center justify-center py-24 gap-3 text-gray-400 dark:text-gray-500">
                <Loader2 size={22} className="animate-spin" />
                <span className="text-sm font-semibold">Chargement de l'inventaire…</span>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 gap-3 text-gray-400 dark:text-gray-500">
                <Package size={40} className="opacity-30" />
                <p className="text-sm font-semibold">Aucun article trouvé</p>
              </div>
            ) : (
              <Table data={products} columns={columns as any} />
            )}
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* ── ADD / EDIT MODAL ── */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={
          <span className="gradient-bleu-or-text">
            {editingProduct ? "Modifier l'Article" : 'Nouvel Article'}
          </span>
        }
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nom de l'article"
              placeholder="ex: Chemise Blanche EIEF"
              value={productForm.name}
              onChange={e => handleProductFormChange('name', e.target.value)}
            />
            <Input
              label="SKU / Référence"
              placeholder="ex: CHB-001"
              value={productForm.sku}
              onChange={e => handleProductFormChange('sku', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Catégorie"
              value={productForm.category}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleProductFormChange('category', e.target.value)
              }
              options={[
                { value: 'Fournitures', label: 'Fournitures' },
                { value: 'Tenues', label: 'Tenues' },
                { value: 'Accessoires', label: 'Accessoires' },
              ]}
            />
            <Input
              label="Prix Unitaire (FGN)"
              type="number"
              placeholder="0"
              value={productForm.price}
              onChange={e => handleProductFormChange('price', parseFloat(e.target.value) || 0)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Stock Initial"
              type="number"
              placeholder="0"
              value={productForm.quantity}
              onChange={e => handleProductFormChange('quantity', parseInt(e.target.value) || 0)}
            />
            <Input
              label="Seuil d'Alerte (Stock Minimum)"
              type="number"
              placeholder="5"
              value={productForm.alertThreshold}
              onChange={e => handleProductFormChange('alertThreshold', parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={formLoading}>
              Annuler
            </Button>
            <Button
              className="bg-bleu-600 text-white flex items-center gap-2"
              onClick={handleSaveProduct}
              disabled={formLoading}
            >
              {formLoading && <Loader2 size={16} className="animate-spin" />}
              {editingProduct ? 'Enregistrer' : "Ajouter l'Article"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── STOCK UPDATE MODAL ── */}
      <Modal
        isOpen={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        title={<span className="gradient-bleu-or-text">Mettre à Jour le Stock</span>}
      >
        <div className="space-y-6">
          <Input
            label="Nouvelle Quantité"
            type="number"
            placeholder="0"
            value={stockQty}
            onChange={e => setStockQty(parseInt(e.target.value) || 0)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setStockModalOpen(false)} disabled={stockLoading}>
              Annuler
            </Button>
            <Button
              className="bg-bleu-600 text-white flex items-center gap-2"
              onClick={handleUpdateStock}
              disabled={stockLoading}
            >
              {stockLoading && <Loader2 size={16} className="animate-spin" />}
              Mettre à Jour
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── DELETE CONFIRM MODAL ── */}
      <Modal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        title={<span className="text-red-500">Supprimer l'Article</span>}
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
            Cette action est irréversible. Voulez-vous vraiment supprimer cet article du stock ?
          </p>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setDeletingId(null)} disabled={deleteLoading}>
              Annuler
            </Button>
            <Button
              className="bg-red-600 text-white flex items-center gap-2"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading && <Loader2 size={16} className="animate-spin" />}
              Supprimer
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── SALE MODAL ── */}
      <Modal
        isOpen={isSaleModalOpen}
        onClose={() => setIsSaleModalOpen(false)}
        title={<span className="gradient-bleu-or-text">Saisir une Vente</span>}
      >
        <div className="space-y-6">
          <Select
            label="Choisir un Article"
            value={saleProductId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSaleProductId(e.target.value)}
            options={products.map(p => ({ value: p.id, label: `${p.name} (${p.quantity} en stock)` }))}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Quantité"
              type="number"
              placeholder="1"
              value={saleQty}
              onChange={e => setSaleQty(Math.max(1, parseInt(e.target.value) || 1))}
            />
            <Input
              label="Prix de vente Total"
              value={saleTotalDisplay}
              disabled
            />
          </div>
          <Input
            label="ID Élève (optionnel)"
            placeholder="UUID de l'élève"
            value={saleStudentId}
            onChange={e => setSaleStudentId(e.target.value)}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setIsSaleModalOpen(false)} disabled={saleLoading}>
              Annuler
            </Button>
            <Button
              className="bg-vert-600 text-white flex items-center gap-2"
              onClick={handleCreateSale}
              disabled={saleLoading || !saleProductId}
            >
              {saleLoading && <Loader2 size={16} className="animate-spin" />}
              Valider la Vente
            </Button>
          </div>
        </div>
      </Modal>

      {/* ── SUCCESS TOAST ── */}
      <AnimatePresence>
        {isSuccess && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[100]"
          >
            <div className="bg-vert-600 text-white px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-5 backdrop-blur-md">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={28} />
              </div>
              <div className="text-left">
                <p className="font-bold text-base tracking-tight">{successMessage}</p>
                <p className="text-[12px] text-white/80 font-semibold italic">
                  L'inventaire de la supérette a été mis à jour.
                </p>
              </div>
              <button
                onClick={() => setIsSuccess(false)}
                className="ml-6 p-2 hover:bg-white/10 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminStore;
