"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignupForm() {
  const router = useRouter();
  const [role, setRole] = useState<"PATIENT" | "CENTER">("PATIENT");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (role === "CENTER" && (!phone.trim() || !city.trim() || !clinicAddress.trim())) {
      setError("Phone number, city, and address are required for Doctor/Center accounts.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
          phone: phone || undefined,
          city: role === "CENTER" ? city : undefined,
          clinicAddress: role === "CENTER" ? clinicAddress : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "PATIENT") {
        router.push("/patient/dashboard");
      } else {
        router.push("/center/dashboard");
      }
    } catch (err) {
      setError("Could not connect to server. Is the backend running?");
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Role selection */}
        <div className="mb-6">
          <Label className="mb-2 block">I am a:</Label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={role === "PATIENT" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setRole("PATIENT")}
            >
              Patient
            </Button>
            <Button
              type="button"
              variant={role === "CENTER" ? "default" : "outline"}
              className="flex-1"
              onClick={() => setRole("CENTER")}
            >
              Clinic / Center
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 gap-4">
          <div>
            <Label htmlFor="name" className="pb-1">
              {role === "CENTER" ? "Clinic / Center Name" : "Full Name"} <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="email" className="pb-1">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="phone" className="pb-1">
              Phone Number {role === "CENTER" && <span className="text-red-500">*</span>}
            </Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required={role === "CENTER"}
            />
          </div>

          {role === "CENTER" && (
            <>
              <div>
                <Label htmlFor="city" className="pb-1">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="clinicAddress" className="pb-1">
                  Clinic / Center Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="clinicAddress"
                  type="text"
                  value={clinicAddress}
                  onChange={(e) => setClinicAddress(e.target.value)}
                  required
                />
              </div>
            </>
          )}

          <div>
            <Label htmlFor="password" className="pb-1">
              Password <span className="text-red-500">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}