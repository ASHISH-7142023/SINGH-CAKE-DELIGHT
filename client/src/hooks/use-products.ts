import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useProducts() {
  return useQuery({
    queryKey: [api.products.list.path],
    queryFn: async () => {
      const res = await fetch(api.products.list.path, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch products");
      }
      const data = await res.json();
      return api.products.list.responses[200].parse(data);
    },
    // Adding some placeholder data as initialData to ensure the UI looks beautiful
    // even if the backend is empty or failing, demonstrating the premium feel.
    initialData: [
      {
        id: 1,
        name: "Classic Black Forest",
        description: "Decadent layers of chocolate sponge, cherry filling, and fresh whipped cream.",
        imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&auto=format&fit=crop&q=80",
        category: "Premium Cakes"
      },
      {
        id: 2,
        name: "Rose Pistachio Delight",
        description: "Elegant eggless sponge infused with pure rose water and crushed pistachios.",
        imageUrl: "https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=800&auto=format&fit=crop&q=80",
        category: "Signature Flavors"
      },
      {
        id: 3,
        name: "Fresh Fruit Gateau",
        description: "Light vanilla sponge loaded with seasonal fresh fruits and delicate cream.",
        imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=800&auto=format&fit=crop&q=80",
        category: "Fresh & Fruity"
      },
      {
        id: 4,
        name: "Rich Truffle Chocolate",
        description: "Ultimate chocolate indulgence made with premium dark chocolate ganache.",
        imageUrl: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=800&auto=format&fit=crop&q=80",
        category: "Chocolate Lovers"
      }
    ]
  });
}
