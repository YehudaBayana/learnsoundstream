"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Login } from "../../components/login/Login";
import { Register } from "../../components/register/Register";
import { useGetCurrentUser, useLogout } from "../../query/useAuth";

interface AuthViewProps {
  dataHook?: string;
}

export default function AuthView({ dataHook = "auth-view" }: AuthViewProps) {
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
      <div
        className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
        data-hook={dataHook}
      >
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gray-50 px-4"
      data-hook={dataHook}
    >
      {/* Container View toggling between Login and Register */}
      {data?.user ? (
        <div className="text-center" data-hook={`${dataHook}-authenticated`}>
          <h2 className="text-2xl font-bold text-gray-900">
            You are logged in to {data.user.email}
          </h2>
          <button
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => logout()}
            data-hook={`${dataHook}-logout`}
          >
            log out
          </button>
        </div>
      ) : isLogin ? (
        <Login
          onSwitchToRegister={() => setIsLogin(false)}
          dataHook={`${dataHook}-login`}
        />
      ) : (
        <Register
          onSwitchToLogin={() => setIsLogin(true)}
          dataHook={`${dataHook}-register`}
        />
      )}
    </div>
  );
}
