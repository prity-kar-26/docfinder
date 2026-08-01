// import LoginForm from "@/components/auth/LoginForm";

// export default function LoginPage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
//       <LoginForm />
//     </div>
//   );
// }

import LoginForm from "@/components/auth/LoginForm";
import BackButton from "@/components/shared/BackButton";

export default function LoginPage() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('/hero-doctor.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 backdrop-blur-md bg-black/50" />

      <BackButton />

      <div className="relative z-10 w-full max-w-lg px-4">
        <LoginForm />
      </div>
    </div>
  );
}