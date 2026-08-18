import Link from "next/link"
import ThemeToggle from "@/components/shared/ThemeToggle"
import NotificationBell from "@/components/shared/NotificationBell"
import ProfileMenu from "@/components/shared/ProfileMenu"

export default function Navbar() {
  return (
    // <nav className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-900 dark:border-gray-800">
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
        DocFinder
      </Link>

      <div className="flex items-center gap-2">
        <ProfileMenu />
        <NotificationBell />
        <ThemeToggle />
      </div>
    </nav>
  )
}