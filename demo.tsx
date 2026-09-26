"use client";

import { useState } from "react";
import { MenuItemCard } from "@/components/ui/menu-item-card";

const menuItems = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1000&q=85",
    isVegetarian: true,
    name: "Flat White",
    price: 18,
    originalPrice: 18,
    quantity: "12 oz",
    prepTimeInMinutes: 5,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=1000&q=85",
    isVegetarian: true,
    name: "Cold Brew",
    price: 20,
    originalPrice: 20,
    quantity: "15 oz",
    prepTimeInMinutes: 5,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1000&q=85",
    isVegetarian: true,
    name: "Butter Croissant",
    price: 12,
    originalPrice: 12,
    quantity: "1 piece",
    prepTimeInMinutes: 3,
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=1000&q=85",
    isVegetarian: true,
    name: "Grilled Panini",
    price: 24,
    originalPrice: 24,
    quantity: "Serves 1",
    prepTimeInMinutes: 8,
  },
];

export default function MenuItemCardDemo() {
  const [addedItem, setAddedItem] = useState<string | null>(null);

  return (
    <section
      id="menu"
      className="scroll-mt-24 bg-[#f7f4ee] px-5 py-20 sm:px-10 sm:py-28 lg:px-16"
    >
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-10 flex flex-col justify-between gap-5 md:mb-14 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[#8f6f3b]">
              A taste of Rogers
            </p>
            <h2 className="font-display text-4xl text-[#322624] sm:text-5xl">
              House favourites
            </h2>
          </div>
          <p className="max-w-md text-sm leading-6 text-[#6b625b]">
            A few warming cups and freshly baked bites to start with. Prices
            are shown in Qatari riyals.
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {menuItems.map((item) => (
            <MenuItemCard
              key={item.name}
              {...item}
              onAdd={() => setAddedItem(item.name)}
            />
          ))}
        </div>

        <p aria-live="polite" className="mt-5 min-h-5 text-sm text-[#692336]">
          {addedItem ? `${addedItem} added to your selections.` : ""}
        </p>
      </div>
    </section>
  );
}
