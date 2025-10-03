import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import API_BASE from '../lib/api_endpoint';

export default function Login({ setUser }) {  // ✅ receive setUser from App.jsx
  const Navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await axios.post(
        `${API_BASE}/users/login`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      setSuccessMsg(res.data.message);
      console.log("User Data:", res.data);

      // Store token and user in localStorage
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // Update App-level user state immediately
      setUser(res.data.user);

      // Redirect to profile page (or home if you want)
      Navigate("/");
    } catch (err) {
      if (err.response) {
        setErrorMsg(err.response.data.message || "Something went wrong");
      } else {
        setErrorMsg("Server not reachable");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-[#411E3A] to-[#0D1A2F] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#0D1A2F] rounded-2xl p-6 sm:p-8 shadow-xl border border-slate-800">
        {/* Header */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#09D8C7] text-center mb-2">
          Welcome Back
        </h1>
        <p className="text-gray-400 text-center text-sm mb-6">
          Sign in to continue to your account
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-[#09D8C7] text-sm font-medium mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-md bg-transparent border border-slate-700 text-white text-sm focus:outline-none focus:border-[#09D8C7]"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[#09D8C7] text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-md bg-transparent border border-slate-700 text-white text-sm focus:outline-none focus:border-[#09D8C7] pr-14"
                required
              />
              {/* Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-[#09D8C7] hover:text-cyan-400"
              >
                {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="text-right">
            <Link to="/forgot-password" className="text-xs text-[#09D8C7] hover:text-gray-400">
              Forgot Password?
            </Link>
          </div>

          {/* Error / Success Messages */}
          {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
          {successMsg && <p className="text-green-500 text-sm">{successMsg}</p>}

          {/* Sign In button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-md transition-all duration-300"
          >
            {loading ? "Signing In..." : "SIGN IN"}
          </button>
        </form>

        {/* Sign Up */}
        <p className="text-center text-sm text-gray-400 mt-6 pb-20">
          Don’t have an account?{" "}
          <Link to="/register" className="text-[#09D8C7] hover:text-cyan-400">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
