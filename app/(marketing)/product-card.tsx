import { Button } from "@/components/ui/button";
import { LucideIcon, MessageSquare } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

type ProductCardProps = {
  ProductIcon: LucideIcon;
  productName: string;
  tag: string; // Available Now, Coming Soon, etc.
  description: string;
  characteristics: {
    Icon?: ReactNode;
    label: string;
  }[];
  cta: {
    url: string;
    Icon: LucideIcon;
    label: string;
  };
};

export default function ProductCard({
  ProductIcon,
  productName,
  tag,
  description,
  characteristics,
  cta,
}: ProductCardProps) {
  return (
    <div className="relative group overflow-hidden rounded-2xl border border-primary/10 shadow-sm transition-all hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 duration-300">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent opacity-80 transition-opacity group-hover:opacity-100"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 opacity-70 group-hover:opacity-100 transition-opacity"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/10 rounded-full blur-3xl -ml-12 -mb-12 opacity-70 group-hover:opacity-100 transition-opacity"></div>

      <div className="relative p-8 flex flex-col h-full">
        <div className="flex items-center gap-4 mb-6">
          <div className="rounded-full bg-primary/10 p-3 shadow-md shadow-primary/5 group-hover:shadow-primary/20 transition-all relative">
            <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping opacity-75 group-hover:opacity-100"></div>
            <ProductIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <div className="inline-block rounded-full bg-primary/10 py-1 text-xs text-primary mb-1 font-medium animate-shimmer">
              {tag}
            </div>
            <h3 className="text-2xl font-bold">{productName}</h3>
          </div>
        </div>

        <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
          {description}
        </p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          {characteristics.map((characteristic, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl glass-effect group-hover:border-primary/20 transition-all"
            >
              <div className="rounded-full bg-primary/10 p-2 shadow-sm">
                {characteristic.Icon && characteristic.Icon}
              </div>
              <span className="font-medium">{characteristic.label}</span>
            </div>
          ))}
        </div>

        <Button size="lg" className="group" asChild>
          <Link href={cta.url}>
            {cta.label}
            <cta.Icon className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
