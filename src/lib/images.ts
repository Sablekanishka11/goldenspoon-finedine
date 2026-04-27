// Centralized image map so DB image_url paths resolve to bundled assets.
import salmon from "@/assets/dish-salmon.jpg";
import caprese from "@/assets/dish-caprese.jpg";
import pasta from "@/assets/dish-pasta.jpg";
import risotto from "@/assets/dish-risotto.jpg";
import dessert from "@/assets/dish-dessert.jpg";
import pizza from "@/assets/dish-pizza.jpg";
import drink from "@/assets/dish-drink.jpg";
import hero from "@/assets/hero.jpg";

const map: Record<string, string> = {
  "/src/assets/dish-salmon.jpg": salmon,
  "/src/assets/dish-caprese.jpg": caprese,
  "/src/assets/dish-pasta.jpg": pasta,
  "/src/assets/dish-risotto.jpg": risotto,
  "/src/assets/dish-dessert.jpg": dessert,
  "/src/assets/dish-pizza.jpg": pizza,
  "/src/assets/dish-drink.jpg": drink,
  "/src/assets/hero.jpg": hero,
};

export function resolveImage(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return map[url] ?? url;
}

export { hero as heroImage };
