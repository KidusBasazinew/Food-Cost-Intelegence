import React, { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Search,
  PlusCircle,
  ShoppingBag,
  Minus,
  Plus,
  Trash2,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { recipesApi } from "@/features/recipes/api/recipesApi";
import { posService } from "@/services/pos.service";

function centsToETB(cents) {
  const n = Number(cents ?? 0);
  if (!Number.isFinite(n)) return 0;
  return n / 100;
}

function recipeCategoryToPosCategory(category) {
  switch (category) {
    case "BREAKFAST":
      return "Breakfast";
    case "DRINK":
      return "Drinks";
    case "MAIN":
    case "SIDE":
    case "APPETIZER":
    case "SALAD":
    case "SOUP":
    case "SNACK":
    case "DESSERT":
      return "Lunch";
    default:
      return "All";
  }
}

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
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBfrYJAPeHisqgpFWApnEOxDTFnapgIt9-RY4esECayWr323HbN-lzndgQ6YzLDDjdCWnhe02u2e33RAmTED7UsyEhi7mU04ZXGm5bphWRnvpEm5M__CqZHFwb7qUmt0Q39h3chv-VtJahfvY4DSHZMc8-Z2X0fwe76_9MKAHj2_vu6tX4EQeIw49HoilLjkA5SfewIqflyd6FXG605J4QdnmrISPHy_RCn7fV4-U8EEh61N1HlwoO14Ck-e2QeAL1UM0wN3pc",
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
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBT_zCmwbkneZPvAXizrC0LGhDT1u_f9RAsFD8dWziiLbsAJMAq60CiqE_p6X0AiWJFJJQBvm6idG2aQZg-ESLYvkWdNpL2hfoaKRyiBbI2BOPSd1NwqN8hzvH9za3Rcb1kID6P0jlMjS4ZG2jp9zLEoV-rEw67y9_4iJjAaVlgZhiQ74jlGX4Kk45evmuO-CYkKzfy2GJeHsPb7T6zEsPvOlEMY1rw",
  },
];

export default function ElitePOS() {
  const [menuMeals, setMenuMeals] = useState(INITIAL_MEALS);
  const [menuLoading, setMenuLoading] = useState(false);

  // Navigation & Filtering State
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Cart State
  const [cart, setCart] = useState([]);

  // Order State
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [activeOrderStatus, setActiveOrderStatus] = useState("DRAFT");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadMenu() {
      setMenuLoading(true);
      try {
        const rows = await recipesApi.list({ status: "ACTIVE" });
        if (!mounted) return;

        const mapped = (rows ?? []).map((r) => ({
          id: r.id,
          name: r.name,
          description: r.description || "",
          price: centsToETB(r.sellingPriceCents),
          category: recipeCategoryToPosCategory(r.category),
          tag: null,
          image:
            r.imageUrl ||
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAZrjSx462fjkzouToRG0nSQGlKj879LqFBq3nPqllBKQKYwTSMu-9iHMDqjJ2iM66KnronAa20S-mlU28BqqtVFZLb4EvHvKwdMGWNAb6mQqv4BQSjUM-FtJ1_lqe1ndwe01fpoW_T04AXF4FbmCwro-8NUZdHN1OAB-t2a_daqgjYXdT2ZTlNQQUHuu4dqaz7ECd-LG4dqWDsyvNeYDITrDq2KQLqW3ZFdvaGaDvQCOOL_BPdQ7KXv0sVUum2uirqVBpilOl4rs4",
        }));

        if (mapped.length > 0) setMenuMeals(mapped);
      } catch (err) {
        toast.error(err?.message || "Failed to load menu recipes");
      } finally {
        if (mounted) setMenuLoading(false);
      }
    }

    loadMenu();
    return () => {
      mounted = false;
    };
  }, []);

  // Computed: Filter Meals
  const filteredMeals = useMemo(() => {
    return menuMeals.filter((meal) => {
      const matchesCategory =
        activeCategory === "All" || meal.category === activeCategory;
      const matchesSearch =
        meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        meal.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery, menuMeals]);

  // Computed: Cart Totals
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

  // Cart Handlers
  const handleAddToOrder = (meal) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.recipeId === meal.id,
      );
      if (existingIndex > -1) {
        const nextCart = [...prevCart];
        nextCart[existingIndex] = {
          ...nextCart[existingIndex],
          quantity: nextCart[existingIndex].quantity + 1,
        };
        return nextCart;
      }
      return [
        ...prevCart,
        {
          recipeId: meal.id,
          name: meal.name,
          price: meal.price,
          quantity: 1,
          notes: "Standard prep",
          image: meal.image,
        },
      ];
    });
  };

  const handleUpdateQuantity = (id, amount) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.recipeId === id) {
            const nextQty = item.quantity + amount;
            return nextQty > 0 ? { ...item, quantity: nextQty } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveItem = (id) => {
    setCart((prevCart) => prevCart.filter((item) => item.recipeId !== id));
  };

  async function handleSendToKitchen() {
    if (cart.length === 0) return;
    setSending(true);
    try {
      const input = {
        items: cart.map((c) => ({
          recipeId: c.recipeId,
          quantity: c.quantity,
          notes: c.notes,
        })),
      };

      if (!activeOrderId) {
        const res = await posService.sendToKitchen(input);
        const order = res?.order;
        setActiveOrderId(order?.id ?? null);
        setActiveOrderStatus(order?.status ?? "SENT_TO_KITCHEN");
      } else {
        await posService.updateOrder(activeOrderId, input);
        if (activeOrderStatus === "DRAFT") {
          const res = await posService.updateStatus(
            activeOrderId,
            "SENT_TO_KITCHEN",
          );
          setActiveOrderStatus(res?.order?.status ?? "SENT_TO_KITCHEN");
        } else {
          toast.success("Order updated");
          return;
        }
      }

      toast.success("Sent to kitchen!");
      setCart([]);
      setActiveOrderId(null);
      setActiveOrderStatus("DRAFT");
    } catch (err) {
      const shortage = err?.data?.details?.shortages?.[0];
      if (shortage) {
        toast.error(
          `Insufficient stock: ${shortage.name} (need ${shortage.requiredQtyInBaseUnit}, have ${shortage.availableQtyInBaseUnit})`,
        );
      } else {
        toast.error(err?.message || "Failed to send to kitchen");
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-background text-on-surface font-body-md overflow-hidden h-full w-full flex flex-col">
      {/* Top Navigation Bar: Changed from fixed layout to standard layout wrapper flow */}
      <header className="w-full flex-shrink-0 flex justify-between items-center px-6 h-12 bg-surface/80 backdrop-blur-xl border-b border-outline-variant/30 shadow-sm">
        <span className="font-headline-md text-xl font-900 tracking-tight text-primary">
          ELITE POS
        </span>
        <div className="relative cursor-pointer group">
          <div className="p-2 rounded-full hover:bg-surface-container-high transition-colors">
            <Bell className="w-5 h-5 text-on-surface-variant" />
          </div>
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full border-2 border-surface"></span>
        </div>
      </header>

      {/* Main 2-Panel Layout: Cleared absolute top padding to stack cleanly beneath header */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left/Center Panel: Menu Browser */}
        <section className="flex-1 bg-surface flex flex-col overflow-hidden">
          {/* Search and Category Filter */}
          <div className="p-6 space-y-6 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
              <input
                className="w-full h-12 pl-12 pr-4 bg-surface-container-low border-none rounded-2xl focus:ring-2 focus:ring-primary/20 font-body-md text-on-surface"
                placeholder="Search recipes..."
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
                        ? "bg-linear-to-br from-purple-600 to-indigo-700 text-white shadow-md"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {category}
                  </button>
                ),
              )}
            </div>
          </div>

          {/* Recipe Grid */}
          <div className="flex-1 overflow-y-auto px-6 pb-24 custom-scrollbar">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {menuLoading ? (
                <div className="col-span-full text-center text-on-surface-variant py-10">
                  Loading menu…
                </div>
              ) : filteredMeals.length === 0 ? (
                <div className="col-span-full text-center text-on-surface-variant py-10">
                  No recipes found.
                </div>
              ) : (
                filteredMeals.map((meal) => (
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
                            meal.tag === "Popular"
                              ? "bg-primary"
                              : "bg-secondary"
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
                ))
              )}
            </div>
          </div>
        </section>

        {/* Right Panel: Cart */}
        <aside className="w-[30%] min-w-[320px] bg-surface-container-lowest border-l border-outline-variant/20 flex flex-col shadow-2xl z-20 overflow-hidden">
          {/* Cart Header */}
          <div className="p-6 border-b border-outline-variant/20 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="font-headline-sm text-lg font-semibold">
                Current Order
              </h2>
              {activeOrderId && (
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-surface-container-high text-on-surface-variant">
                  {activeOrderStatus.replaceAll("_", " ")}
                </span>
              )}
            </div>
            <span className="bg-surface-container-high px-2.5 py-1 rounded-full font-label-md text-xs font-medium text-primary">
              {totals.itemCount} {totals.itemCount === 1 ? "Item" : "Items"}
            </span>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            {cart.map((item) => (
              <div
                key={item.recipeId}
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
                      onClick={() => handleUpdateQuantity(item.recipeId, -1)}
                      className="p-1 hover:bg-surface-container-highest rounded text-on-surface-variant flex items-center justify-center"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="text-xs px-2 font-semibold select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleUpdateQuantity(item.recipeId, 1)}
                      className="p-1 hover:bg-surface-container-highest rounded text-on-surface-variant flex items-center justify-center"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.recipeId)}
                    className="p-1.5 hover:bg-surface-container-highest rounded-lg transition-colors text-error flex items-center justify-center"
                    title="Remove item"
                  >
                    <Trash2 className="text-red-600 w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
            {cart.length === 0 && (
              <div className="text-center py-16 text-on-surface-variant text-sm">
                Select recipes to add them to the order.
              </div>
            )}
          </div>

          {/* Totals & Send */}
          <div className="p-6 bg-surface-container-low/50 border-t border-outline-variant/30 space-y-6 flex-shrink-0">
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
            <button
              onClick={handleSendToKitchen}
              disabled={cart.length === 0 || sending}
              className="w-full h-14 bg-primary disabled:opacity-50 text-white rounded-2xl font-label-lg text-sm font-semibold shadow-lg shadow-primary/20 active:scale-[0.97] transition-all flex items-center justify-center gap-2"
            >
              <Send className="w-5 h-5" />
              {sending ? "Sending…" : "Send To Kitchen"}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}
