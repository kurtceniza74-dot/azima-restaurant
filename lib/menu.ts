/**
 * Rogers Cafe Qatar — menu data.
 *
 * DEMO CONTENT: items, prices, and photos are placeholders that show how the
 * layout behaves. Replace them with the cafe's confirmed menu before launch
 * (names, descriptions, QAR prices, and your own photography).
 */
export type MenuCategory =
  | "All"
  | "Coffee"
  | "Iced Coffee"
  | "Tea & Hot Drinks"
  | "Cold Drinks"
  | "Pastries & Desserts"
  | "Light Bites"
  | "Sandwiches";

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: Exclude<MenuCategory, "All">;
  imageUrl: string;
  prepTime: number;
}

export const menuItems: MenuItem[] = [
  // Coffee
  {
    id: "espresso",
    name: "Espresso",
    description: "A short, full-bodied shot to start the day",
    price: 14,
    category: "Coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=480&q=80",
    prepTime: 4,
  },
  {
    id: "flat-white",
    name: "Flat White",
    description: "Double espresso with silky steamed milk",
    price: 18,
    category: "Coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=480&q=80",
    prepTime: 5,
  },
  {
    id: "cappuccino",
    name: "Cappuccino",
    description: "Espresso, milk, and a soft layer of foam",
    price: 18,
    category: "Coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=480&q=80",
    prepTime: 5,
  },

  // Iced Coffee
  {
    id: "cold-brew",
    name: "Cold Brew",
    description: "Slow-steeped coffee served over ice",
    price: 20,
    category: "Iced Coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=480&q=80",
    prepTime: 5,
  },
  {
    id: "iced-latte",
    name: "Iced Latte",
    description: "Chilled espresso poured over milk and ice",
    price: 20,
    category: "Iced Coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?auto=format&fit=crop&w=480&q=80",
    prepTime: 5,
  },
  {
    id: "mocha-frappe",
    name: "Mocha Frappe",
    description: "Blended coffee, chocolate, and cream",
    price: 24,
    category: "Iced Coffee",
    imageUrl:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=480&q=80",
    prepTime: 7,
  },

  // Tea & Hot Drinks
  {
    id: "karak-chai",
    name: "Karak Chai",
    description: "Strong tea simmered with milk and spice",
    price: 12,
    category: "Tea & Hot Drinks",
    imageUrl:
      "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=480&q=80",
    prepTime: 5,
  },
  {
    id: "green-tea",
    name: "Green Tea",
    description: "Freshly steeped, light and warming",
    price: 14,
    category: "Tea & Hot Drinks",
    imageUrl:
      "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=480&q=80",
    prepTime: 4,
  },
  {
    id: "matcha-latte",
    name: "Matcha Latte",
    description: "Ceremonial-style matcha with steamed milk",
    price: 22,
    category: "Tea & Hot Drinks",
    imageUrl:
      "https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=480&q=80",
    prepTime: 6,
  },

  // Cold Drinks
  {
    id: "fresh-orange-juice",
    name: "Fresh Orange Juice",
    description: "Squeezed to order, served cold",
    price: 18,
    category: "Cold Drinks",
    imageUrl:
      "https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=480&q=80",
    prepTime: 4,
  },
  {
    id: "strawberry-lime-cooler",
    name: "Strawberry Lime Cooler",
    description: "Muddled strawberry, lime, and a splash of soda",
    price: 18,
    category: "Cold Drinks",
    imageUrl:
      "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=480&q=80",
    prepTime: 5,
  },
  {
    id: "citrus-cooler",
    name: "Citrus Cooler",
    description: "A bright, chilled citrus refresher",
    price: 20,
    category: "Cold Drinks",
    imageUrl:
      "https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=480&q=80",
    prepTime: 5,
  },

  // Pastries & Desserts
  {
    id: "butter-croissant",
    name: "Butter Croissant",
    description: "Flaky, buttery, baked through the morning",
    price: 12,
    category: "Pastries & Desserts",
    imageUrl:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=480&q=80",
    prepTime: 3,
  },
  {
    id: "chocolate-layer-cake",
    name: "Chocolate Layer Cake",
    description: "Soft layers with a rich chocolate finish",
    price: 22,
    category: "Pastries & Desserts",
    imageUrl:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=480&q=80",
    prepTime: 4,
  },
  {
    id: "brownie-a-la-mode",
    name: "Brownie à la Mode",
    description: "Warm brownie, ice cream, and caramel",
    price: 26,
    category: "Pastries & Desserts",
    imageUrl:
      "https://images.unsplash.com/photo-1551024506-0bccd828d307?auto=format&fit=crop&w=480&q=80",
    prepTime: 6,
  },

  // Light Bites
  {
    id: "avocado-toast",
    name: "Avocado Toast",
    description: "Smashed avocado, egg, and greens on toast",
    price: 26,
    category: "Light Bites",
    imageUrl:
      "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=480&q=80",
    prepTime: 8,
  },
  {
    id: "garden-salad-bowl",
    name: "Garden Salad Bowl",
    description: "Seasonal vegetables with a light dressing",
    price: 28,
    category: "Light Bites",
    imageUrl:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=480&q=80",
    prepTime: 7,
  },
  {
    id: "artisan-bread-basket",
    name: "Artisan Bread Basket",
    description: "Freshly baked breads to share",
    price: 16,
    category: "Light Bites",
    imageUrl:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=480&q=80",
    prepTime: 5,
  },

  // Sandwiches
  {
    id: "classic-sandwich",
    name: "Classic Sandwich",
    description: "Layers of fillings on fresh sliced bread",
    price: 26,
    category: "Sandwiches",
    imageUrl:
      "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=480&q=80",
    prepTime: 8,
  },
  {
    id: "grilled-panini",
    name: "Grilled Panini",
    description: "Pressed until crisp, served with dips",
    price: 24,
    category: "Sandwiches",
    imageUrl:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=480&q=80",
    prepTime: 8,
  },
];

export const menuCategories: MenuCategory[] = [
  "All",
  "Coffee",
  "Iced Coffee",
  "Tea & Hot Drinks",
  "Cold Drinks",
  "Pastries & Desserts",
  "Light Bites",
  "Sandwiches",
];

/** Ids curated for the "featured" strips on the homepage. */
export const featuredDrinkIds = ["flat-white", "cold-brew", "matcha-latte"] as const;
export const featuredFoodIds = [
  "butter-croissant",
  "grilled-panini",
  "chocolate-layer-cake",
] as const;

export const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "QAR",
    maximumFractionDigits: 0,
  }).format(price);