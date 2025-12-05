"use client";

import { ChevronLeftIcon } from "@/icons";
import Link from "next/link";
import React from "react";
import { auth, googleProvider, microsoftProvider } from "@/lib/firebase";
import { signInWithPopup, AuthProvider, User } from "firebase/auth";

export default function SignInForm() {

  const allowedDomain = "artboxsolutions.com";

  googleProvider.setCustomParameters({
    prompt: "select_account",
  });

  const loginSSO = async (provider: AuthProvider): Promise<void> => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user: User = result.user;

      const email = user.email ?? "";
      const domain = email.split("@")[1]?.toLowerCase() ?? "";

      if (domain !== allowedDomain) {
        await auth.signOut();
        alert("Only organization accounts allowed.");
        return;
      }

      /** 🔥 ASSIGN ROLE */
      const role = email.toLowerCase() === "info@artboxsolutions.com"
        ? "admin"
        : "rider";

      /** 🔥 SAVE COOKIES */
      document.cookie = "authUser=true; path=/;";
      document.cookie = `userRole=${role}; path=/;`;

      /** 🔥 REDIRECT BASED ON ROLE */
      if (role === "admin") {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/dashboard";
      }

    } catch (error) {
      console.error("Sign-in failed:", error);
      alert("Login failed");
    }
  };
  return (
    <div className="flex flex-col flex-1 lg:w-1/2 w-full">
      <div className="w-full max-w-md sm:pt-10 mx-auto mb-5">
        <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700">
          <ChevronLeftIcon />
          Back to dashboard
        </Link>
      </div>

      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
              <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Sign In
            </h1>
            <p className="text-sm text-gray-500">
              Organization Access Only
            </p>
          </div>

          <div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5">

              {/* GOOGLE LOGIN */}
              <button
                onClick={() => loginSSO(googleProvider)}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm bg-gray-100 rounded-lg px-7 hover:bg-gray-200"
              >
                Sign in with Google
              </button>

              {/* MICROSOFT LOGIN */}
              <button
                onClick={() => loginSSO(microsoftProvider)}
                className="inline-flex items-center justify-center gap-3 py-3 text-sm bg-gray-100 rounded-lg px-7 hover:bg-gray-200"
              >
                Sign in Microsoft
              </button>

            </div>
            
            <div className="relative py-3 sm:py-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="p-2 text-gray-400 bg-white dark:bg-gray-900 sm:px-5 sm:py-2">
                  SSO login required
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
