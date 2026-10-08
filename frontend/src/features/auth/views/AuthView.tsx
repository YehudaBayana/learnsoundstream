"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Login } from "../components/Login";
import { Register } from "../components/Register";
import { useGetCurrentUser, useLogout } from "../query/useAuth";

export default function AuthView() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const router = useRouter();
  const { data, isLoading } = useGetCurrentUser();
  const { mutate: logout } = useLogout();

  useEffect(() => {
    if (data?.user.id) {
      router.push("/");
    }
  }, [data?.user.id, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      {/* Container View toggling between Login and Register */}
      {data?.user ? (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">
            You are logged in to {data.user.email}
          </h2>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => logout()}
          >
            log out
          </button>
        </div>
      ) : isLogin ? (
        <Login onSwitchToRegister={() => setIsLogin(false)} />
      ) : (
        <Register onSwitchToLogin={() => setIsLogin(true)} />
      )}
    </div>
  );
}
