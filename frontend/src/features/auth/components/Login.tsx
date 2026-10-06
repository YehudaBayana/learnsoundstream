import React, { useEffect, useState } from "react";
import { useLogin } from "../query/useAuth";

interface LoginProps {
  onSwitchToRegister: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ email, password });
  };

  return (
    <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
        <p className="text-sm text-gray-500 mt-1">
          Please enter your details to sign in
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            placeholder="••••••••"
          />
        </div>

        <button
          type="submit"
          className="w-full mt-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm rounded-lg shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Sign In
        </button>
      </form>

      <div className="mt-6 text-center text-sm text-gray-500">
        Don't have an account?{" "}
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none underline"
        >
          Sign up
        </button>
      </div>
    </div>
  );
};
