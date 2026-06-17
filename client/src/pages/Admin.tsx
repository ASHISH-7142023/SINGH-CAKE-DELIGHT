import { useState, useEffect } from "react";
import { useIsDark } from "@/hooks/use-is-dark";
import { Button } from "@/components/ui/button";
import { 
  ShieldAlert, CheckCircle, Trash2, MessageCircle, Clock, 
  Calendar, CheckCircle2, ListFilter, RefreshCw, LogOut, Lock 
} from "lucide-react";

interface Order {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  cakeName: string | null;
  cakeImage: string | null;
  notes: string | null;
  pickupDate: string;
  pickupTime: string;
  status: string;
  createdAt: string;
}

export default function Admin() {
  const isDark = useIsDark();
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [authError, setAuthError] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");

  useEffect(() => {
    const savedToken = localStorage.getItem("admin_session");
    if (savedToken) {
      setIsAuthenticated(true);
      fetchOrders(savedToken);
    }
  }, []);

  const fetchOrders = async (token: string) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/orders", {
        headers: {
          "x-admin-password": token
        }
      });
      if (!res.ok) {
        if (res.status === 401) {
          handleLogout();
          throw new Error("Session expired. Please log in again.");
        }
        throw new Error("Failed to fetch orders.");
      }
      const data = await res.json();
      // Sort orders by id descending (newest first)
      setOrders(data.sort((a: Order, b: Order) => b.id - a.id));
    } catch (err: any) {
      setError(err.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/orders", {
        headers: {
          "x-admin-password": password
        }
      });
      if (!res.ok) {
        throw new Error("Invalid password");
      }
      localStorage.setItem("admin_session", password);
      setIsAuthenticated(true);
      const data = await res.json();
      setOrders(data.sort((a: Order, b: Order) => b.id - a.id));
    } catch (err: any) {
      setAuthError("Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_session");
    setIsAuthenticated(false);
    setPassword("");
    setOrders([]);
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    const token = localStorage.getItem("admin_session") || "";
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": token
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm("Are you sure you want to delete this order request?")) return;
    const token = localStorage.getItem("admin_session") || "";
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": token
        }
      });
      if (!res.ok) throw new Error("Failed to delete order");
      
      setOrders(prev => prev.filter(o => o.id !== orderId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Helper to construct secure WhatsApp chat link to contact the customer
  const getWhatsAppLink = (phone: string, cakeName: string | null, pickupDate: string) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const waPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
    
    let message = "Hi! I received your order request from Singh Cake Delight.";
    if (cakeName) {
      message += ` I'd love to confirm your order details for the ${cakeName} pickup on ${pickupDate}.`;
    }
    return `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === "pending") return order.status === "pending";
    if (filter === "completed") return order.status === "completed";
    return true;
  });

  const totalPending = orders.filter(o => o.status === "pending").length;
  const totalCompleted = orders.filter(o => o.status === "completed").length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        <div className="max-w-md w-full bg-card rounded-2xl border border-border/80 p-8 fancy-shadow text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-3xl text-foreground mb-2">Admin Dashboard</h2>
          <p className="text-muted-foreground text-sm mb-6">Enter password to view and manage customer order requests.</p>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div className="space-y-1.5">
              <label htmlFor="pass" className="text-xs font-semibold text-muted-foreground">Admin Password</label>
              <input
                id="pass"
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-background border border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-primary transition-all text-foreground"
              />
            </div>
            
            {authError && (
              <p className="text-red-500 text-xs font-medium">{authError}</p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2.5 rounded-xl mt-2"
            >
              {isLoading ? "Authenticating..." : "Login Dashboard"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full overflow-hidden">
              <img src="/og_cake_og.png" alt="Singh Cake Delight" className="w-full h-full object-cover" />
            </div>
            <span className="font-display font-bold text-lg tracking-wide text-primary">
              Singh Cake Delight Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => fetchOrders(localStorage.getItem("admin_session") || "")}
              disabled={isLoading}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary/40 rounded-lg transition-all"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? "animate-spin text-primary" : ""}`} />
            </button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="rounded-lg border-border/60 hover:bg-red-500/10 hover:text-red-500 transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-card border border-border/50 rounded-2xl p-6 fancy-shadow flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Booking Requests</p>
              <h3 className="font-display font-bold text-3xl mt-1 text-foreground">{orders.length}</h3>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          
          <div className="bg-card border border-border/50 rounded-2xl p-6 fancy-shadow flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Bookings</p>
              <h3 className="font-display font-bold text-3xl mt-1 text-amber-500">{totalPending}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          
          <div className="bg-card border border-border/50 rounded-2xl p-6 fancy-shadow flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Completed Orders</p>
              <h3 className="font-display font-bold text-3xl mt-1 text-green-500">{totalCompleted}</h3>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-border/40 pb-5">
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-semibold text-muted-foreground">Filter by Status:</span>
            <div className="flex bg-secondary/50 p-1 rounded-xl border border-border/40 ml-2">
              {(["all", "pending", "completed"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`text-xs px-3.5 py-1.5 rounded-lg font-medium transition-all ${
                    filter === type 
                      ? "bg-card text-foreground font-semibold shadow-sm border border-border/40" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Errors */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 rounded-xl mb-6 text-sm font-medium flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0" /> {error}
          </div>
        )}

        {/* Orders Table Card */}
        <div className="bg-card border border-border/50 rounded-2xl overflow-hidden fancy-shadow">
          {isLoading && orders.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground gap-3">
              <RefreshCw className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm">Fetching booking requests...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="py-20 text-center text-muted-foreground">
              <Calendar className="w-10 h-10 mx-auto opacity-40 mb-3" />
              <p className="font-semibold text-sm">No orders found matching the filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-secondary/20 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    <th className="p-5">Order ID</th>
                    <th className="p-5">Customer</th>
                    <th className="p-5">Cake Request</th>
                    <th className="p-5">Pickup Schedule</th>
                    <th className="p-5">Status</th>
                    <th className="p-5">Special Notes</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-secondary/10 transition-colors">
                      <td className="p-5 font-mono text-xs font-semibold text-muted-foreground">
                        #{order.id}
                      </td>
                      <td className="p-5">
                        <div className="font-semibold text-foreground text-base">{order.customerName}</div>
                        <div className="text-xs text-muted-foreground font-medium mt-0.5">{order.customerPhone}</div>
                        {order.customerEmail && (
                          <div className="text-xs text-primary/80 font-medium mt-0.5">{order.customerEmail}</div>
                        )}
                      </td>
                      <td className="p-5">
                        {order.cakeName ? (
                          <div className="flex items-center gap-2.5">
                            {order.cakeImage && (
                              <img src={order.cakeImage} alt={order.cakeName} className="w-9 h-9 rounded object-cover border border-border" />
                            )}
                            <span className="font-medium text-foreground">{order.cakeName}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">General Inquiry</span>
                        )}
                      </td>
                      <td className="p-5">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-primary" /> {order.pickupDate}
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-1">
                          <Clock className="w-4 h-4 text-muted-foreground" /> {order.pickupTime}
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold leading-none ${
                          order.status === "completed" 
                            ? "bg-green-500/15 text-green-500" 
                            : "bg-amber-500/15 text-amber-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${order.status === "completed" ? "bg-green-500" : "bg-amber-500"}`}></span>
                          {order.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="p-5 max-w-xs">
                        <p className="text-foreground/80 leading-relaxed truncate hover:text-clip hover:whitespace-normal" title={order.notes || ""}>
                          {order.notes || <span className="text-muted-foreground/60 italic text-xs">No notes</span>}
                        </p>
                      </td>
                      <td className="p-5 text-right space-x-2 whitespace-nowrap">
                        <a
                          href={getWhatsAppLink(order.customerPhone, order.cakeName, order.pickupDate)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors shadow-sm"
                          title="Contact Customer via WhatsApp"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        
                        {order.status === "pending" ? (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "completed")}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white transition-colors border border-amber-500/20"
                            title="Mark Completed"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUpdateStatus(order.id, "pending")}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-secondary text-muted-foreground hover:bg-muted transition-colors border border-border"
                            title="Mark Pending"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                          title="Delete Order Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
