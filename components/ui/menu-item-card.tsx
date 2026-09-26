"use client";

import * as React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";

interface MenuItemCardProps extends HTMLMotionProps<"div"> {
  imageUrl: string;
  isVegetarian: boolean;
  name: string;
  price: number;
  originalPrice: number;
  quantity: string;
  prepTimeInMinutes: number;
  onAdd: () => void;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "QAR",
  minimumFractionDigits: 0,
});

const MenuItemCard = React.forwardRef<HTMLDivElement, MenuItemCardProps>(
  (
    {
      className,
      imageUrl,
      isVegetarian,
      name,
      price,
      originalPrice,
      quantity,
      prepTimeInMinutes,
      onAdd,
      ...props
    },
    ref
  ) => {
    const savings = Math.max(originalPrice - price, 0);

    const cardVariants = {
      initial: {
        opacity: 0,
        y: 20,
      },
      animate: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.4,
        },
      },
      hover: {
        scale: 1.025,
        transition: {
          duration: 0.2,
        },
      },
    };

    const buttonVariants = {
      tap: {
        scale: 0.95,
      },
    };

    const vegIconVariants = {
      initial: {
        scale: 0,
      },
      animate: {
        scale: 1,
        transition: {
          delay: 0.3,
          type: "spring" as const,
          stiffness: 200,
        },
      },
    };

    return (
      <motion.div
        ref={ref}
        className={cn(
          "group relative flex w-full max-w-sm flex-col overflow-hidden",
          "rounded-md border border-[#692336]/15",
          "bg-card text-card-foreground",
          "shadow-[0_15px_50px_rgba(64,27,38,0.10)]",
          "transition-shadow duration-300",
          "hover:border-[#8f6f3b]/55",
          "hover:shadow-[0_20px_70px_rgba(64,27,38,0.17)]",
          className
        )}
        variants={cardVariants}
        initial="initial"
        animate="animate"
        whileHover="hover"
        layout
        {...props}
      >
        <div className="relative overflow-hidden">
          <img
            src={imageUrl}
            alt={name}
            className="h-52 w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#26171a] via-[#26171a]/15 to-transparent" />

          <motion.div
            className="absolute right-3 top-3"
            variants={vegIconVariants}
            aria-label={isVegetarian ? "Vegetarian" : "Non-Vegetarian"}
          >
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-md border bg-[#07142b]/90 backdrop-blur-md",
                isVegetarian
                  ? "border-emerald-400/70"
                  : "border-red-400/70"
              )}
            >
              <div
                className={cn(
                  "h-3 w-3 rounded-full",
                  isVegetarian ? "bg-emerald-400" : "bg-red-400"
                )}
              />
            </div>
          </motion.div>

          <div className="absolute bottom-4 left-1/2 flex w-full -translate-x-1/2 justify-center">
            <motion.button
              type="button"
              onClick={onAdd}
              variants={buttonVariants}
              whileTap="tap"
              className="translate-y-0 rounded-sm border border-white/20 bg-[#692336]/95 px-7 py-2.5 text-sm font-semibold uppercase tracking-wide text-white opacity-100 shadow-xl backdrop-blur-md transition-all duration-300 hover:bg-[#4f1929] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d8bd86] focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f4ee] md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100"
              aria-label={`Add ${name} to cart`}
            >
              Add
            </motion.button>
          </div>
        </div>

        <div className="flex flex-grow flex-col p-5 text-left">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-xl font-bold text-[#692336]">
              {currencyFormatter.format(price)}
            </span>

            {originalPrice > price && (
              <span className="text-sm text-slate-500 line-through">
                {currencyFormatter.format(originalPrice)}
              </span>
            )}

            {savings > 0 && (
              <span className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                Save {currencyFormatter.format(savings)}
              </span>
            )}
          </div>

          <p className="mt-1.5 text-sm text-[#847972]">{quantity}</p>

          <h3 className="mt-3 text-lg font-semibold leading-tight text-[#322624]">
            {name}
          </h3>

          <div className="mt-auto flex items-center gap-1.5 pt-4 text-xs text-[#847972]">
            <Clock className="h-3.5 w-3.5 text-[#8f6f3b]" />
            <span>{prepTimeInMinutes} mins</span>
          </div>
        </div>
      </motion.div>
    );
  }
);

MenuItemCard.displayName = "MenuItemCard";

export { MenuItemCard };
