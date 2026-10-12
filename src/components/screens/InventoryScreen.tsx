import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, ProductCategory, PurchaseOrder } from '../../types';
import { formatPKR, formatDate, exportToCSV } from '../../utils/formatters';
import { Modal } from '../common/Modal';
import {
  Boxes,
  Plus,
  Search,
  Download,
  AlertTriangle,
  History,
  Edit,
  Trash2,
  Package,
  ArrowUpDown,
  Building,
  Store,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

export const InventoryScreen: React.FC = () => {
  const {
    products,
    purchaseOrders,
    sales,
    dispatches,
    returns,
    getProductStock,
    addPurchaseOrder,
    addProduct,
    updateProduct,
    deleteProduct,
    addToast,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<'All' | 'Showroom' | 'Godown'>('All');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // PO Panel / Form State
  const [poSupplier, setPoSupplier] = useState('Gree Pakistan Distributor (DWP)');
  const [poProductId, setPoProductId] = useState(products[0]?.id || '');
  const [poQty, setPoQty] = useState<number>(5);
  const [poUnitCost, setPoUnitCost] = useState<number>(products[0]?.costPrice || 100000);
  const [poDestination, setPoDestination] = useState<'Showroom' | 'Godown'>('Showroom');

  // Add / Edit Product Modal
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodModel, setProdModel] = useState('');
  const [prodCategory, setProdCategory] = useState<ProductCategory>('Air Conditioner');
  const [prodCostPrice, setProdCostPrice] = useState<number>(0);
  const [prodRetailPrice, setProdRetailPrice] = useState<number>(0);
  const [prodWholesalePrice, setProdWholesalePrice] = useState<number>(0);
  const [prodMinLevel, setProdMinLevel] = useState<number>(4);
  const [prodImageUrl, setProdImageUrl] = useState('');
  const [prodShowroomStock, setProdShowroomStock] = useState<number>(5);
  const [prodGodownStock, setProdGodownStock] = useState<number>(10);

  // Movement History Modal
  const [historyProduct, setHistoryProduct] = useState<Product | null>(null);

  // Categories list
  const categories = [
    'All',
    'Air Conditioner',
    'Refrigerator',
    'Washing Machine',
    'LED TV',
    'Kitchen Appliances',
    'Small Appliances',
  ];

  // Sync PO unit cost when product selection changes
  const handlePoProductChange = (id: string) => {
    setPoProductId(id);
    const p = products.find((prod) => prod.id === id);
    if (p) {
      setPoUnitCost(p.costPrice);
    }
  };

  // Submit PO
  const handleCreatePo = (e: React.FormEvent) => {
    e.preventDefault();
    const p = products.find((prod) => prod.id === poProductId);
    if (!p) return;

    addPurchaseOrder({
      date: '2026-10-12',
      supplier: poSupplier,
      productId: p.id,
      productName: p.name,
      qty: Number(poQty),
      unitCost: Number(poUnitCost),
      total: Number(poQty) * Number(poUnitCost),
      destination: poDestination,
    });

    setPoQty(5);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const stock = getProductStock(p.id);
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.model.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesLocation =
        selectedLocation === 'All' ||
        (selectedLocation === 'Showroom' && stock.showroom > 0) ||
        (selectedLocation === 'Godown' && stock.godown > 0);
      const matchesLowStock = !filterLowStockOnly || stock.isLow;

      return matchesSearch && matchesCat && matchesLocation && matchesLowStock;
    });
  }, [products, searchQuery, selectedCategory, selectedLocation, filterLowStockOnly, getProductStock]);

  // Low stock products count
  const lowStockCount = useMemo(() => {
    return products.filter((p) => getProductStock(p.id).isLow).length;
  }, [products, getProductStock]);

  // Movement Timeline for Selected Product
  const movementHistory = useMemo(() => {
    if (!historyProduct) return [];

    type MovementEntry = {
      date: string;
      type: 'Purchase PO' | 'Retail Sale' | 'Wholesale Dispatch' | 'Return';
      refId: string;
      delta: number;
      location: string;
      notes: string;
    };

    const list: MovementEntry[] = [];

    // Purchases
    purchaseOrders
      .filter((po) => po.productId === historyProduct.id)
      .forEach((po) => {
        list.push({
          date: po.date,
          type: 'Purchase PO',
          refId: po.id,
          delta: +po.qty,
          location: po.destination,
          notes: `Supplier: ${po.supplier}`,
        });
      });

    // Sales
    sales.forEach((s) => {
      const line = s.items.find((i) => i.productId === historyProduct.id);
      if (line) {
        list.push({
          date: s.date,
          type: 'Retail Sale',
          refId: s.id,
          delta: -line.qty,
          location: 'Showroom',
          notes: `Customer: ${s.customerName}`,
        });
      }
    });

    // Dispatches
    dispatches.forEach((d) => {
      const line = d.items.find((i) => i.productId === historyProduct.id);
      if (line) {
        list.push({
          date: d.date,
          type: 'Wholesale Dispatch',
          refId: d.id,
          delta: -line.qty,
          location: 'Godown',
          notes: `Dealer: ${d.dealerName}`,
        });
      }
    });

    // Returns
    returns
      .filter((r) => r.productId === historyProduct.id)
      .forEach((r) => {
        list.push({
          date: r.date,
          type: 'Return',
          refId: r.id,
          delta: +r.qty,
          location: r.type === 'Retail' ? 'Showroom' : 'Godown',
          notes: `${r.type} Return from ${r.partyName}`,
        });
      });

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [historyProduct, purchaseOrders, sales, dispatches, returns]);

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Item Name',
      'Brand',
      'Model',
      'Category',
      'Cost Price (PKR)',
      'Retail Price (PKR)',
      'Wholesale Price (PKR)',
      'Showroom Stock',
      'Godown Stock',
      'Total Stock',
      'Min Level',
      'Status',
    ];

    const rows = products.map((p) => {
      const stock = getProductStock(p.id);
      return [
        p.name,
        p.brand,
        p.model,
        p.category,
        p.costPrice,
        p.retailPrice,
        p.wholesalePrice,
        stock.showroom,
        stock.godown,
        stock.total,
        p.minLevel,
        stock.isLow ? 'Low Stock' : 'In Stock',
      ];
    });

    exportToCSV('Sadat_Group_Inventory_Stock', headers, rows);
  };

  // Submit Product Modal
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    if (editingProduct) {
      updateProduct({
        ...editingProduct,
        name: prodName.trim(),
        brand: prodBrand.trim(),
        model: prodModel.trim(),
        category: prodCategory,
        costPrice: Number(prodCostPrice),
        retailPrice: Number(prodRetailPrice),
        wholesalePrice: Number(prodWholesalePrice),
        minLevel: Number(prodMinLevel),
        imageUrl: prodImageUrl || editingProduct.imageUrl,
      });
    } else {
      addProduct({
        name: prodName.trim(),
        brand: prodBrand.trim(),
        model: prodModel.trim(),
        category: prodCategory,
        costPrice: Number(prodCostPrice),
        retailPrice: Number(prodRetailPrice),
        wholesalePrice: Number(prodWholesalePrice),
        minLevel: Number(prodMinLevel),
        imageUrl:
          prodImageUrl ||
          'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
        targetBusiness: 'both',
        showroomStock: Number(prodShowroomStock) || 0,
        godownStock: Number(prodGodownStock) || 0,
      });
    }

    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E6ECF3]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Stock Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Live stock, low stock alerts, stock movement log & purchase orders
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setProdName('');
              setProdBrand('');
              setProdModel('');
              setProdCategory('Air Conditioner');
              setProdCostPrice(0);
              setProdRetailPrice(0);
              setProdWholesalePrice(0);
              setProdMinLevel(4);
              setProdImageUrl('');
              setProdShowroomStock(5);
              setProdGodownStock(10);
              setIsProductModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E6BFF] hover:bg-blue-600 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Item</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Stock Table (8 cols) + Purchase Order Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Inventory Table Section (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-4 rounded-[14px] border border-[#E6ECF3] shadow-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search products by name or brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs font-medium focus:ring-1 focus:ring-[#1E6BFF]"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Category Dropdown */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Location Selector */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value as any)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="All">All Locations</option>
                <option value="Showroom">Showroom Only</option>
                <option value="Godown">Godown Only</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-[14px] border border-[#E6ECF3] shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="py-3 px-4">Item Details</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Showroom</th>
                    <th className="py-3 px-4 text-center">Godown</th>
                    <th className="py-3 px-4 text-center">Total Stock</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredProducts.map((p) => {
                    const stock = getProductStock(p.id);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-[200px]">
                                {p.name}
                              </p>
                              <p className="text-[11px] text-slate-400">
                                {p.brand} • Retail: {formatPKR(p.retailPrice)}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600 font-semibold">
                          {p.category}
                        </td>
                        <td className="py-3 px-4 text-center tabular-nums font-bold text-slate-800">
                          {stock.showroom}
                        </td>
                        <td className="py-3 px-4 text-center tabular-nums font-bold text-slate-800">
                          {stock.godown}
                        </td>
                        <td className="py-3 px-4 text-center tabular-nums font-extrabold text-slate-900">
                          {stock.total}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              stock.isLow
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {stock.isLow ? 'Low Stock' : 'In Stock'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5">
                          <button
                            onClick={() => setHistoryProduct(p)}
                            className="px-2 py-1 rounded-lg bg-blue-50 text-[#1E6BFF] hover:bg-blue-100 font-bold text-[11px] transition-colors"
                            title="View Stock Movement History"
                          >
                            History
                          </button>
                          <button
                            onClick={() => {
                              handlePoProductChange(p.id);
                              setPoQty(p.minLevel);
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-[11px] transition-colors"
                            title="Reorder Item"
                          >
                            Reorder
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setProdName(p.name);
                              setProdBrand(p.brand);
                              setProdModel(p.model);
                              setProdCategory(p.category);
                              setProdCostPrice(p.costPrice);
                              setProdRetailPrice(p.retailPrice);
                              setProdWholesalePrice(p.wholesalePrice);
                              setProdMinLevel(p.minLevel);
                              setProdImageUrl(p.imageUrl);
                              setIsProductModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600"
                            title="Edit Product"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Alert Bar */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <button
                onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
                className="flex items-center gap-1.5 font-bold text-rose-600 hover:underline"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  Low Stock Alert: {lowStockCount} items below minimum level{' '}
                  {filterLowStockOnly ? '(Click to Show All)' : '(Click to Filter)'}
                </span>
              </button>

              <span className="text-slate-400">
                Formula: Opening + Purchases - Sales - Dispatches + Returns
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Purchase Order Panel (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-[14px] border border-[#E6ECF3] shadow-md p-5 space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Purchase Order</h3>
            <p className="text-xs text-slate-500">
              Procure stock from manufacturer & auto-increment inventory
            </p>
          </div>

          <form onSubmit={handleCreatePo} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Supplier / Manufacturer *
              </label>
              <input
                type="text"
                required
                value={poSupplier}
                onChange={(e) => setPoSupplier(e.target.value)}
                placeholder="e.g. Gree Pakistan, Nasgas Factory Direct"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Product Item *
              </label>
              <select
                value={poProductId}
                onChange={(e) => handlePoProductChange(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Quantity *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={poQty}
                  onChange={(e) => setPoQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Unit Cost (Rs.) *
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={poUnitCost}
                  onChange={(e) => setPoUnitCost(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Destination Stock Location
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPoDestination('Showroom')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    poDestination === 'Showroom'
                      ? 'bg-[#1E6BFF] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Showroom</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPoDestination('Godown')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    poDestination === 'Godown'
                      ? 'bg-[#16A34A] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <Building className="w-3.5 h-3.5" />
                  <span>Godown</span>
                </button>
              </div>
            </div>

            {/* Total PO Calculation */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Total PO Amount:</span>
                <span className="text-[#1E6BFF] tabular-nums font-black text-sm">
                  {formatPKR(poQty * poUnitCost)}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Instantly marks status as Received and increments stock levels.
              </p>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-[#1E6BFF] hover:bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create PO & Receive Stock</span>
            </button>
          </form>
        </div>
      </div>

      {/* STOCK MOVEMENT HISTORY MODAL */}
      <Modal
        isOpen={!!historyProduct}
        onClose={() => setHistoryProduct(null)}
        title={`Stock Movement History: ${historyProduct?.name}`}
        subtitle="Full audit trail of purchases, sales, wholesale dispatches and returns"
        maxWidth="2xl"
      >
        {historyProduct && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-center">
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase block">
                  Showroom Stock
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  {getProductStock(historyProduct.id).showroom}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase block">
                  Godown Stock
                </span>
                <span className="text-base font-extrabold text-slate-900">
                  {getProductStock(historyProduct.id).godown}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] font-bold uppercase block">
                  Total Combined
                </span>
                <span className="text-base font-black text-[#1E6BFF]">
                  {getProductStock(historyProduct.id).total}
                </span>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
              {movementHistory.length === 0 ? (
                <div className="p-6 text-center text-slate-400 text-xs">
                  No stock transactions recorded yet for this item.
                </div>
              ) : (
                movementHistory.map((m, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{m.refId}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {m.type}
                        </span>
                        <span className="text-slate-400 text-[11px]">• {m.location}</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">{m.notes}</p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-extrabold tabular-nums ${
                          m.delta > 0 ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {m.delta > 0 ? `+${m.delta}` : m.delta}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {formatDate(m.date)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* ADD / EDIT PRODUCT MODAL */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'Edit Catalog Product' : 'Add New Product to Catalog'}
        subtitle="Manage product pricing, specs, and low stock thresholds"
        maxWidth="2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Product Full Name *
            </label>
            <input
              type="text"
              required
              value={prodName}
              onChange={(e) => setProdName(e.target.value)}
              placeholder="e.g. Gree 1.5 Ton Inverter AC"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Brand
              </label>
              <input
                type="text"
                value={prodBrand}
                onChange={(e) => setProdBrand(e.target.value)}
                placeholder="Gree, Haier, Faber, Nasgas"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Model #
              </label>
              <input
                type="text"
                value={prodModel}
                onChange={(e) => setProdModel(e.target.value)}
                placeholder="Model code"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Category
              </label>
              <select
                value={prodCategory}
                onChange={(e) => setProdCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
              >
                {categories.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Min Stock Level (Alert Trigger)
              </label>
              <input
                type="number"
                min="1"
                value={prodMinLevel}
                onChange={(e) => setProdMinLevel(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"
              />
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Cost Price (Rs.) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={prodCostPrice}
                onChange={(e) => setProdCostPrice(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white tabular-nums"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Retail Price (Rs.) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={prodRetailPrice}
                onChange={(e) => setProdRetailPrice(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white tabular-nums"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                Wholesale Price (Rs.) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={prodWholesalePrice}
                onChange={(e) => setProdWholesalePrice(Number(e.target.value))}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-bold bg-white tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Image URL (Unsplash or direct image)
            </label>
            <input
              type="url"
              value={prodImageUrl}
              onChange={(e) => setProdImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium"
            />
          </div>

          {!editingProduct && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Initial Showroom Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={prodShowroomStock}
                  onChange={(e) => setProdShowroomStock(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Initial Godown Stock
                </label>
                <input
                  type="number"
                  min="0"
                  value={prodGodownStock}
                  onChange={(e) => setProdGodownStock(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                />
              </div>
            </div>
          )}

          <div className="flex justify-between items-center pt-2">
            {editingProduct && (
              <button
                type="button"
                onClick={() => {
                  const res = deleteProduct(editingProduct.id);
                  if (res.success) {
                    setIsProductModalOpen(false);
                  }
                }}
                className="text-rose-600 hover:text-rose-700 text-xs font-bold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Product</span>
              </button>
            )}

            <div className="flex gap-2 ml-auto">
              <button
                type="button"
                onClick={() => setIsProductModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#1E6BFF] text-white text-xs font-bold shadow-md shadow-blue-500/20"
              >
                Save Product
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};
