import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <main>
      {/* Hero section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4"
        style={{
          backgroundImage: "url('/hero-doctor.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay so text stays readable over any photo */}
        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
            DocFinder
          </h1>
          <p className="text-lg md:text-2xl text-gray-200 mb-8">
            Quality care, one appointment away.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="w-full sm:w-auto"> Sign Up </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white/10 text-white border-white hover:bg-white/20" >
                Log In
              </Button>
            </Link>
          </div>
        </div>

        {/* Simple scroll hint */}
        
        <a href="#about" className="absolute bottom-8 z-10 text-white text-sm animate-bounce">
          ↓ Learn more
        </a>
      </section>

      {/* About section */}
      <section id="about" className="py-20 px-4 bg-gray-50 dark:bg-gray-900 text-center" >
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            About DocFinder
          </h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            DocFinder connects patients with trusted doctors and clinics in
            their area. Search by specialty or location, book an appointment
            in a few clicks, and manage your visits all in one place. Doctors
            and clinics can list their practice, manage their schedule, and
            reach more patients — all through a simple, modern platform.
          </p>
        </div>
      </section>
    </main>
  );
}