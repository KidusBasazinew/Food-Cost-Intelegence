import React, { useState, useMemo } from "react";
import {
  MapPin,
  Bell,
  Clock,
  MoveUp,
  Merge,
  Scissors,
  XCircle,
  Search,
  PlusCircle,
  ShoppingBag,
  Minus,
  Plus,
  Edit,
  Trash2,
  Send,
  Save,
  SlidersHorizontal,
  X,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Static Data matching your initial structure
const INITIAL_MEALS = [
  {
    id: "beef-steak",
    name: "Beef Steak Premium",
    description: "Grass-fed ribeye, herbal butter.",
    price: 24.99,
    category: "Dinner",
    tag: "Popular",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBp69L8D9cPeMMqB99UhtHR8aNCHgACQPgzSKlQq3Skfdd1d6WiGFt7D7KZbCFvz3m2KVcz4RluaSzX2nWMfKvfrkzC_UjfynHfR8RjhRS2IutbrUmfxL2cFMoESJ8NeVnkkYwhXTsOfjsOQgGH2gaE5zp4kZX1Xv1MTbqVCAhS_aNZlZs2clDAKZ94t3aeLozBnXEnCqgM3XiNG8DbtVitJnmlKq0OnfoZqpk7AnYsFW47O0mdVRwkOtfyJMGA3zl08gNy7qX517A",
  },
  {
    id: "grilled-chicken",
    name: "Grilled Chicken Deluxe",
    description: "Tender breast, roasted veggies.",
    price: 18.5,
    category: "Lunch",
    tag: "Best Seller",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBfrYJAPeHisqgpFWEfSWApnEOxDTFnapgIt9-RY4esECayWr323HbN-lzndgQ6YzLDDjdCWnhe02u2e33RAmTED7UsyEhi7mU04ZXGm5bphWRnvpEm5M__CqZHFwb7qUmt0Q39h3chv-VtJahfvY4DSHZMc8-Z2X0fwe76_9MKAHj2_vu6tX4EQeIw49HoilLjkA5SfewIqflyd6FXG605J4QdnmrISPHy_RCn7fV4-U8EEh61N1HlwoO14Ck-e2QeAL1UM0wN3pc",
  },
  {
    id: "classic-burger",
    name: "Classic Burger",
    description: "Wagyu patty, aged cheddar, brioche.",
    price: 12.99,
    category: "Lunch",
    tag: null,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAZrjSx462fjkzouToRG0nSQGlKj879LqFBq3nPqllBKQKYwTSMu-9iHMDqjJ2iM66KnronAa20S-mlU28BqqtVFZLb4EvHvKwdMGWNAb6mQqv4BQSjUM-FtJ1_lqe1ndwe01fpoW_T04AXF4FbmCwro-8NUZdHN1OAB-t2a_daqgjYXdT2ZTlNQQUHuu4dqaz7ECd-LG4dqWDsyvNeYDITrDq2KQLqW3ZFdvaGaDvQCOOL_BPdQ7KXv0sVUum2uirqVBpilOl4rs4",
  },
  {
    id: "margherita-pizza",
    name: "Margherita Pizza",
    description: "Buffalo mozzarella, San Marzano tomatoes.",
    price: 16.5,
    category: "Dinner",
    tag: null,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBykhGnBcEZ3w-D6gkHqQ1XyDiCuPodupTDCFfklffkBQlAg7l3utzC6Nyhv249ctJF0H3uvM9WYQ2Yt6RSHGGxFC9HA1sJ_gu2_67FROdEdqdfSDmrs2uu3-lOuabrqHFGORJZ_yIrF3HvfjnERk_BqwnuY5j5YgZwwv18jwF7byNA3D5kOocY7Ig4uY_a_ee_R33UolhisdZiJop9gELlX481XZSFaDeM4jWo4Jc3YKBW9dREfYP76fRiw_LhOJ3skMgAUyAt3gI",
  },
  {
    id: "orange-juice",
    name: "Fresh Orange Juice",
    description: "100% Organic citrus, cold-pressed.",
    price: 4.5,
    category: "Drinks",
    tag: null,
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBT_zCmwbkneZPvAXizrC0LGhDT1u_f9RAsFD8dWziiLbsAJMAq60CiqE_p6X0AiWJFJJQBvm6idG2aQZg-ESLYvkWdNpL2hfoaKRyiBbI2BOPSd1NwqN8hzvH9za3Rcb1kID6P0jlMjS4ZG2jp9zLEoV-rEw67y9_4iJjAaVlgZhiQ74jlGX4Kk45evmuO-CYkKzfy2GJeHPNwXUtcrVf0Ch8QhHRUgpXBcA0wVHwdVEx7cNeAtB4RbhELH-w5T6zEsPvOlEMY1rw",
  },
];

const tableNumber = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const initialTablesData = {
  1: {
    guests: "4 Person",
    waiter: "Julian S.",
    status: "Ordering",
    time: "12:45",
  },
  2: {
    guests: "2 Person",
    waiter: "Sarah M.",
    status: "Served",
    time: "13:10",
  },
  3: {
    guests: "6 Person",
    waiter: "Marcus K.",
    status: "Check Requested",
    time: "11:30",
  },
  4: {
    guests: "0 Person",
    waiter: "Unassigned",
    status: "Vacant",
    time: "--:--",
  },
  // Add as many tables as your restaurant layout needs...
};
export default function ElitePOS() {
  //const [tables, setTables] = useState(initialTablesData);
  const [currentTable, setCurrentTable] = useState(1);
  const [isTableSelectorOpen, setIsTableSelectorOpen] = useState(false);

  // Extract the active table details dynamically
  const activeTableDetails = initialTablesData[currentTable] || {
    guests: "0 Person",
    waiter: "Unassigned",
    status: "Vacant",
    time: "--:--",
  };

  // Navigation & Filtering State
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Cart State
  const [cart, setCart] = useState([
    {
      id: "beef-steak",
      name: "Beef Steak Premium",
      price: 24.99,
      quantity: 1,
      notes: "Medium Rare, Extra Sauce",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBp69L8D9cPeMMqB99UhtHR8aNCHgACQPgzSKlQq3Skfdd1d6WiGFt7D7KZbCFvz3m2KVcz4RluaSzX2nWMfKvfrkzC_UjfynHfR8RjhRS2IutbrUmfxL2cFMoESJ8NeVnkkYwhXTsOfjsOQgGH2gaE5zp4kZX1Xv1MTbqVCAhS_aNZlZs2clDAKZ94t3aeLozBnXEnCqgM3XiNG8DbtVitJnmlKq0OnfoZqpk7AnYsFW47O0mdVRwkOtfyJMGA3zl08gNy7qX517A",
    },
    {
      id: "classic-burger",
      name: "Classic Burger",
      price: 12.99,
      quantity: 2,
      notes: "Standard prep",
      image:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBp69L8D9cPeMMqB99UhtHR8aNCHgACQPgzSKlQq3Skfdd1d6WiGFt7D7KZbCFvz3m2KVcz4RluaSzX2nWMfKvfrkzC_UjfynHfR8RjhRS2IutbrUmfxL2cFMoESJ8NeVnkkYwhXTsOfjsOQgGH2gaE5zp4kZX1Xv1MTbqVCAhS_aNZlZs2clDAKZ94t3aeLozBnXEnCqgM3XiNG8DbtVitJnmlKq0OnfoZqpk7AnYsFW47O0mdVRwkOtfyJMGA3zl08gNy7qX517A",
    },
  ]);

  // Modal/Customization Drawer State
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Computed Properties: Filter Meals
  const filteredMeals = useMemo(() => {
    return INITIAL_MEALS.filter((meal) => {
      const matchesCategory =
        activeCategory === "All" || meal.category === activeCategory;
      const matchesSearch =
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  // Computed Properties: Cart Math Totals
  const totals = useMemo(() => {
    const subtotal = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );
    const tax = subtotal * 0.09;
    const serviceCharge = subtotal > 0 ? 5.0 : 0.0;
    const total = subtotal + tax + serviceCharge;

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      serviceCharge: serviceCharge.toFixed(2),
      total: total.toFixed(2),
      itemCount: cart.reduce((sum, item) => sum + item.quantity, 0),
    };
  }, [cart]);

  // Cart Operations Handlers
  const handleAddToOrder = (meal) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.id === meal.id);
      if (existingIndex > -1) {
        const nextCart = [...prevCart];
        nextCart[existingIndex].quantity += 1;
        return nextCart;
      }
      return [
        ...prevCart,
        {
          id: meal.id,
          name: meal.name,
          price: meal.price,
          quantity: 1,
          notes: "Standard prep",
        },
      ];
    });
  };

  const handleUpdateQuantity = (id, amount) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === id) {
            const nextQty = item.quantity + amount;
            return nextQty > 0 ? { ...item, quantity: nextQty } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0);
    });
  };

  const handleRemoveItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const handleClearOrder = () => {
    if (window.confirm("Are you sure you want to cancel the current order?")) {
      setCart([]);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body-md overflow-hidden h-screen w-screen flex flex-col">
      {/* Top Navigation Shell */}
      <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-6 h-12 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
        <div className="flex items-center gap-4">
          <span className="font-headline-md text-xl font-900 tracking-tight text-primary">
            ELITE POS
          </span>
          <div className="h-6 w-px bg-outline-variant/50 mx-2"></div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-label-lg text-sm font-semibold text-on-surface">
              Floor 1 - Station 4
            </span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="relative cursor-pointer group">
            <div className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
              <Bell className="w-5 h-5 text-on-surface-variant" />
            </div>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
          </div>
          <div className="flex items-center gap-3 bg-surface-container-low px-3 py-1.5 rounded-full">
            <div className="w-8 h-8 rounded-full overflow-hidden border border-primary/20">
              <img
                alt="Waiter Julian"
                className="w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAex2Ys-DIatP-PEs243KZlROYzDTGwLPG-90z78wKF9e2IzaCsB8Bu6P08Wd9xQY7ckiS2QMHYK5l7QvqPrpn95hqIDx_17YVKZ5VX_DoKE6LES2Iw1jKaUxc_0b0sjkSBQAPQHtGpxZ7R2qLMGpJYVEdYxBc2a7cZ-NAPUZe_JH30eZ-Bq6ebb_Ih4byzVsBJTmCdkbPOidBfiAFtzCXKEH_fh_dYQLoVIzPS6YBNcTlux79EaWqwAaOyPnmT3FbKYniY-rp44eM"
              />
            </div>
            <span className="font-label-lg text-sm font-semibold">
              Julian S.
            </span>
          </div>
        </div>
      </header>

      {/* Main 3-Panel Layout */}
      <main className="flex-1 flex pt-12 overflow-hidden">
        {/* Left Panel: Table Context */}
        <aside className="w-[22%] bg-surface-container-low border-r border-outline-variant/20 flex flex-col p-6 gap-8 overflow-y-auto custom-scrollbar">
          {/* Left Panel Header & Context */}
          <div className="space-y-4">
            <div className="flex items-center justify-between relative">
              {/* Table Selector Trigger Button */}
              <button
                onClick={() => setIsTableSelectorOpen(!isTableSelectorOpen)}
                className="flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-lg hover:bg-surface-container-high transition-colors group"
              >
                <h2 className="font-headline-sm text-lg font-semibold text-primary">
                  Table {currentTable}
                </h2>
                <ChevronDown
                  className={`w-4 h-4 text-primary transition-transform duration-200 ${isTableSelectorOpen ? "rotate-180" : ""}`}
                />
              </button>

              {/* Floating Table Selector Dropdown */}
              {isTableSelectorOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsTableSelectorOpen(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-zinc-900 border border-outline-variant/30 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <p className="text-xs font-semibold text-on-surface-variant mb-3 px-1 uppercase tracking-wider">
                      Switch Table
                    </p>
                    <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-0.5">
                      {tableNumber.map((number) => {
                        const isSelected = currentTable === number;
                        const hasOrder =
                          initialTablesData[number]?.status !== "Vacant";

                        return (
                          <button
                            key={number}
                            className={`rounded-lg py-2.5 text-sm font-medium border transition-all relative ${
                              isSelected
                                ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                                : "border-outline-variant/10 hover:bg-surface-container-high text-on-surface bg-surface-container-lowest"
                            }`}
                            onClick={() => {
                              setCurrentTable(number);
                              setIsTableSelectorOpen(false);
                            }}
                          >
                            {number}
                            {/* Small dynamic dot indicator showing if a table is occupied/active */}
                            {!isSelected && hasOrder && (
                              <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Dynamic Time Display */}
              <div className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary rounded-full">
                <Clock className="w-4 h-4" />
                <span className="font-label-md text-xs font-medium">
                  {activeTableDetails.time}
                </span>
              </div>
            </div>

            {/* Dynamic Table Context Card */}
            <div className="space-y-3 bg-surface-container-lowest p-4 rounded-xl shadow-sm border border-outline-variant/10">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant/70 font-medium text-sm">
                  Guests
                </span>
                <span className="font-semibold text-on-surface text-sm">
                  {activeTableDetails.guests}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant/70 font-medium text-sm">
                  Waiter
                </span>
                <span className="font-semibold text-on-surface text-sm">
                  {activeTableDetails.waiter}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant/70 font-medium text-sm">
                  Status
                </span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    activeTableDetails.status === "Ordering"
                      ? "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400"
                      : activeTableDetails.status === "Served"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
                        : activeTableDetails.status === "Check Requested"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
                          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
                  }`}
                >
                  {activeTableDetails.status}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="space-y-4">
            <h3 className="font-label-lg text-sm font-semibold text-on-surface-variant px-1">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-3">
              <button className="flex items-center gap-4 px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:bg-surface-container-high transition-all active:scale-95 group">
                <MoveUp className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-label-lg text-sm font-semibold">
                  Transfer
                </span>
              </button>
              <button className="flex items-center gap-4 px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:bg-surface-container-high transition-all active:scale-95 group">
                <Merge className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-label-lg text-sm font-semibold">
                  Merge
                </span>
              </button>
              <button className="flex items-center gap-4 px-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-xl hover:bg-surface-container-high transition-all active:scale-95 group">
                <Scissors className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                <span className="font-label-lg text-sm font-semibold">
                  Split Bill
                </span>
              </button>
            </div>
          </div>

          {/* Bottom Action */}
          <div className="mt-auto pt-6 border-t border-outline-variant/20">
            <Button
              variant="destructive"
              onClick={handleClearOrder}
              className="w-full flex items-center justify-center gap-2 py-3 text-white font-label-lg text-sm font-semibold hover:bg-error/5 rounded-xl transition-colors"
            >
              <XCircle className="w-5 h-5" />
              Cancel Order
            </Button>
          </div>
        </aside>

        {/* Center Panel: Menu Browser */}
        <section className="flex-1 bg-surface flex flex-col overflow-hidden">
          {/* Search and Filter Header */}
          <div className="p-6 space-y-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
              <input
                className="w-full h-12 pl-12 pr-4 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-body-md text-on-surface"
                placeholder="Search meals..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {["All", "Breakfast", "Lunch", "Dinner", "Drinks"].map(
                (category) => (
                  <button
                    key={category}
                    onClick={() => setActiveCategory(category)}
                    className={`px-6 py-2.5 rounded-full font-label-lg text-sm font-semibold whitespace-nowrap transition-all shadow-sm ${
                      activeCategory === category
                        ? "bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-md"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {category}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Grid of Meal Cards */}
          <div className="flex-1 overflow-y-auto px-6 pb-24 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredMeals.map((meal) => (
                <div
                  key={meal.id}
                  onClick={() => handleAddToOrder(meal)}
                  className="group bg-surface-container-lowest rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-outline-variant/10 flex flex-col active:scale-[0.98] cursor-pointer"
                >
                  <div className="relative h-40 overflow-hidden">
                    <img
                      alt={meal.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      src={meal.image}
                    />
                    {meal.tag && (
                      <div
                        className={`absolute top-3 left-3 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter shadow-sm ${
                          meal.tag === "Popular" ? "bg-primary" : "bg-secondary"
                        }`}
                      >
                        {meal.tag}
                      </div>
                    )}
                  </div>
                  <div className="p-4 flex flex-col flex-1">
                    <h4 className="font-headline-sm text-base font-semibold text-on-surface mb-1">
                      {meal.name}
                    </h4>
                    <p className="text-on-surface-variant text-xs mb-4 line-clamp-1">
                      {meal.description}
                    </p>
                    <div className="mt-auto flex items-center justify-between">
                      <span className="font-bold text-primary text-base">
                        ETB {meal.price.toFixed(2)}
                      </span>
                      <div className="bg-primary-container/20 p-2 rounded-xl group-hover:bg-primary transition-colors flex items-center justify-center">
                        <PlusCircle className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {filteredMeals.length === 0 && (
                <div className="col-span-full py-12 text-center text-on-surface-variant">
                  No products match your search/filter parameters.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Panel: Live Order Cart */}
        <aside className="w-[30%] bg-surface-container-lowest border-l border-outline-variant/20 flex flex-col shadow-2xl z-20">
          <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="font-headline-sm text-lg font-semibold">
                Current Order
              </h2>
            </div>
            <span className="bg-surface-container-high px-2.5 py-1 rounded-full font-label-md text-xs font-medium text-primary">
              {totals.itemCount} {totals.itemCount === 1 ? "Item" : "Items"}
            </span>
          </div>

          {/* Order List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {cart.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/10 space-y-3 relative group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="bg-primary-fixed text-purple-900 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm select-none">
                      {item.quantity}x
                    </div>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div>
                      <h4 className="font-label-lg text-sm font-semibold">
                        {item.name}
                      </h4>
                      <p className="text-[12px] text-on-surface-variant leading-relaxed">
                        {item.notes}
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-on-surface">
                    ETB {(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-1.5 bg-surface-container-lowest rounded-lg border border-outline-variant/20 p-0.5">
                    <button
                      onClick={() => handleUpdateQuantity(item.id, -1)}
                      className="p-1 hover:bg-surface-container-highest rounded text-on-surface-variant flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xs px-2 font-semibold select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.id, 1)}
                      className="p-1 hover:bg-surface-container-highest rounded text-on-surface-variant flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsDrawerOpen(true)}
                      className="p-1.5 hover:bg-surface-container-highest rounded-lg transition-colors flex items-center justify-center"
                      title="Edit customizations"
                    >
                      <Edit className="w-5 h-5 text-blue-500" />
                    </button>
                    <button
                      onClick={() => handleRemoveItem(item.id)}
                      className="p-1.5 hover:bg-surface-container-highest rounded-lg transition-colors text-error flex items-center justify-center"
                      title="Remove variant"
                    >
                      <Trash2 className="text-red-600 w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="text-center py-16 text-on-surface-variant text-sm">
                The basket is currently empty. Tap items to construct a
                breakdown.
              </div>
            )}
          </div>

          {/* Totals and Checkout */}
          <div className="p-6 bg-surface-container-low/50 border-t border-outline-variant/30 space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between text-on-surface-variant font-label-lg text-sm">
                <span>Subtotal</span>
                <span>ETB {totals.subtotal}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant font-label-lg text-sm">
                <span>Tax (9%)</span>
                <span>ETB {totals.tax}</span>
              </div>
              <div className="flex justify-between text-on-surface-variant font-label-lg text-sm">
                <span>Service Charge</span>
                <span>ETB {totals.serviceCharge}</span>
              </div>
              <div className="h-px bg-outline-variant/30 my-2"></div>
              <div className="flex justify-between items-center">
                <span className="font-headline-sm text-base font-semibold text-on-surface">
                  Total
                </span>
                <span className="font-headline-md text-xl font-bold text-primary">
                  ETB {totals.total}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() =>
                  alert(
                    `Sending ${totals.itemCount} items to kitchen order queue...`,
                  )
                }
                disabled={cart.length === 0}
                className="w-full h-14 bg-primary disabled:opacity-50 text-white rounded-2xl font-label-lg text-sm font-semibold shadow-lg shadow-primary/20 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Send To Kitchen
              </button>
              <button
                onClick={() => alert("Draft state saved locally.")}
                disabled={cart.length === 0}
                className="w-full h-14 bg-surface-container-highest disabled:opacity-50 text-on-surface-variant rounded-2xl font-label-lg text-sm font-semibold active:scale-[0.97] transition-all flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Save Draft
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* Customization Drawer Trigger Pill */}
      <div
        onClick={() => setIsDrawerOpen(!isDrawerOpen)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-surface-container-highest/60 backdrop-blur-md px-6 py-3 rounded-full border border-white/40 shadow-xl cursor-pointer hover:bg-surface-container-high transition-all z-40"
      >
        <SlidersHorizontal className="w-4 h-4 text-primary" />
        <span className="font-label-md text-xs font-medium text-on-surface">
          {isDrawerOpen
            ? "Close customization matrix panel"
            : "Tap to customize selected item"}
        </span>
      </div>

      {/* Optional Customization Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-end animate-fadeIn">
          <div className="w-96 bg-surface-container-lowest h-full p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-headline-sm text-lg font-semibold">
                  Modifier Customization
                </h3>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="cursor-pointer p-1 hover:bg-surface-container-high rounded-full transition-colors flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-on-surface-variant mb-4">
                Select custom preparation modifiers for the selected recipe
                items.
              </p>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="w-full py-3 bg-primary text-white rounded-xl font-semibold text-sm shadow-md active:scale-98 transition-transform"
            >
              Apply Modifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
