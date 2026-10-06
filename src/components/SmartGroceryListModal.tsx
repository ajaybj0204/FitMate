import React, { useState, useMemo } from 'react';
import { useFitMate } from '../context/FitMateContext';

export const SmartGroceryListModal: React.FC = () => {
  const { groceryItems, toggleGroceryItem, isGroceryModalOpen, setIsGroceryModalOpen, showToast } =
    useFitMate();

  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemCost, setNewItemCost] = useState('80');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');

  const categories = ['All', 'Protein & Dairy', 'Grains & Pulses', 'Produce', 'Pantry & Spices'];

  const filteredItems = useMemo(() => {
    if (activeCategoryFilter === 'All') return groceryItems;
    return groceryItems.filter(item => item.category === activeCategoryFilter);
  }, [groceryItems, activeCategoryFilter]);

  if (!isGroceryModalOpen) return null;

  const totalCost = groceryItems.reduce((sum, item) => sum + (item.estimatedCostInr || 0), 0);
  const checkedCost = groceryItems
    .filter(i => i.checked)
    .reduce((sum, item) => sum + (item.estimatedCostInr || 0), 0);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    groceryItems.unshift({
      id: `groc-${Date.now()}`,
      name: newItemName.trim(),
      quantity: newItemQty.trim() || '1 item',
      category: 'Protein & Dairy',
      estimatedCostInr: Number(newItemCost) || 50,
      checked: false,
    });
    setNewItemName('');
    setNewItemQty('');
    showToast(`Added "${newItemName}" to grocery list!`);
  };

  return (
    <div className="fixed inset-0 bg-[#081425]/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#152031] rounded-2xl w-full max-w-2xl p-6 sm:p-8 shadow-2xl border border-[#1f2a3c] my-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#1f2a3c]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#4edea3]/10 text-[#4edea3] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">shopping_cart</span>
            </div>
            <div>
              <h3 className="font-headline text-lg sm:text-xl font-bold text-[#d8e3fb]">
                Smart Indian Grocery Planner
              </h3>
              <p className="text-xs text-[#86948a]">
                High-protein budget optimization with real Indian INR market pricing
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsGroceryModalOpen(false)}
            className="text-[#86948a] hover:text-[#d8e3fb] p-1.5 rounded-lg hover:bg-[#1f2a3c]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Budget Tally Overview Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 my-4 bg-[#111c2d] p-3.5 rounded-xl border border-[#1f2a3c]">
          <div>
            <span className="text-[10px] text-[#86948a] uppercase font-bold">Total Estimated Basket</span>
            <div className="font-headline text-xl sm:text-2xl font-bold text-[#4edea3] tabular-nums">
              ₹{totalCost}
            </div>
          </div>
          <div>
            <span className="text-[10px] text-[#86948a] uppercase font-bold">Purchased Items</span>
            <div className="font-headline text-xl sm:text-2xl font-bold text-[#d8e3fb] tabular-nums">
              ₹{checkedCost}{' '}
              <span className="text-xs font-normal text-[#86948a]">
                ({groceryItems.filter(i => i.checked).length}/{groceryItems.length})
              </span>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <span className="text-[10px] text-[#86948a] uppercase font-bold">Efficiency Hack</span>
            <div className="text-xs text-[#98da27] font-semibold mt-0.5">
              Soya Chunks = ₹0.23/g protein 💡
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeCategoryFilter === cat
                  ? 'bg-[#4edea3] text-[#003824] font-bold'
                  : 'bg-[#111c2d] text-[#bbcabf] hover:text-[#d8e3fb] border border-[#1f2a3c]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grocery Items List */}
        <div className="divide-y divide-[#1f2a3c]/60 max-h-72 overflow-y-auto pr-1">
          {filteredItems.map(item => (
            <div
              key={item.id}
              onClick={() => toggleGroceryItem(item.id)}
              className={`py-3 px-2 flex items-center justify-between gap-3 hover:bg-[#111c2d]/50 rounded-xl cursor-pointer transition-colors ${
                item.checked ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-[20px] ${
                    item.checked ? 'text-[#4edea3]' : 'text-[#86948a]'
                  }`}
                >
                  {item.checked ? 'check_box' : 'check_box_outline_blank'}
                </span>
                <div>
                  <span
                    className={`text-xs sm:text-sm font-semibold text-[#d8e3fb] ${
                      item.checked ? 'line-through text-[#86948a]' : ''
                    }`}
                  >
                    {item.name}
                  </span>
                  <div className="text-[11px] text-[#86948a]">{item.quantity} • {item.category}</div>
                </div>
              </div>

              <span className="font-headline text-xs sm:text-sm font-bold text-[#d8e3fb] tabular-nums shrink-0">
                ₹{item.estimatedCostInr}
              </span>
            </div>
          ))}
        </div>

        {/* Add custom item form */}
        <form onSubmit={handleAddItem} className="mt-4 pt-4 border-t border-[#1f2a3c] flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Add item (e.g. Sattu, Greek Yogurt)..."
            value={newItemName}
            onChange={e => setNewItemName(e.target.value)}
            className="flex-1 bg-[#111c2d] border border-[#3c4a42] rounded-xl px-3 py-2 text-xs text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
          />
          <input
            type="text"
            placeholder="Qty (e.g. 500g)"
            value={newItemQty}
            onChange={e => setNewItemQty(e.target.value)}
            className="w-24 bg-[#111c2d] border border-[#3c4a42] rounded-xl px-3 py-2 text-xs text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
          />
          <input
            type="number"
            placeholder="₹ Price"
            value={newItemCost}
            onChange={e => setNewItemCost(e.target.value)}
            className="w-20 bg-[#111c2d] border border-[#3c4a42] rounded-xl px-3 py-2 text-xs text-[#d8e3fb] focus:outline-none focus:border-[#4edea3]"
          />
          <button
            type="submit"
            className="bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0"
          >
            Add
          </button>
        </form>

        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setIsGroceryModalOpen(false)}
            className="px-5 py-2.5 rounded-xl bg-[#111c2d] hover:bg-[#1f2a3c] text-[#d8e3fb] text-xs font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
