import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useGallery() {
  return useQuery({
    queryKey: [api.gallery.list.path],
    queryFn: async () => {
      const res = await fetch(api.gallery.list.path, { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to fetch gallery");
      }
      const data = await res.json();
      return api.gallery.list.responses[200].parse(data);
    },
    // Placeholder initial data for a beautiful masonry grid out of the box
    initialData: [
      { id: 1, imageUrl: "https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=800&auto=format&fit=crop&q=80", altText: "Strawberry Cake" },
      { id: 2, imageUrl: "https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=800&auto=format&fit=crop&q=80", altText: "Cupcakes" },
      { id: 3, imageUrl: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format&fit=crop&q=80", altText: "Chocolate Drip Cake" },
      { id: 4, imageUrl: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=800&auto=format&fit=crop&q=80", altText: "Vanilla Berry Cake" },
      { id: 5, imageUrl: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=800&auto=format&fit=crop&q=80", altText: "Artisanal Bread" },
      { id: 6, imageUrl: "https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=800&auto=format&fit=crop&q=80", altText: "Lemon Cake" },
    ]
  });
}
