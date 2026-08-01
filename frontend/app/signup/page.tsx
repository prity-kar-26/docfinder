// import SignupForm from "@/components/auth/SignupForm";

// export default function SignupPage() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
//       <SignupForm />
//     </div>
//   );
// }


import SignupForm from "@/components/auth/SignupForm";
import BackButton from "@/components/shared/BackButton";

export default function SignupPage() {
  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4"
      style={{
        backgroundImage: "url('/hero-doctor.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Blur + dark overlay on top of the image */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/50" />

      <BackButton />

      <div className="relative z-10 w-full max-w-lg px-4">
        <SignupForm />
      </div>
    </div>
  );
}