import Link from "next/link";
import ThemeToggle from "@/components/shared/ThemeToggle";

// Navbar itself is a plain server component — it only becomes interactive where it uses <ThemeToggle />, 
// which is its own separate client component. This is that same server/client split pattern again, just one level deeper
export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
        DocFinder
      </Link>

      <div className="flex items-center gap-4">
        <ThemeToggle />
      </div>
    </nav>
  );
}