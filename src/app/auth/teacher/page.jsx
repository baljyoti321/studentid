"use client";
import React from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { toast, ToastContainer } from "react-toastify";

const teacherPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role: "teacher",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast("Login Successfull!");
        window.location.href = "/teacher";
      } else {
        const error = await response.json();
        console.error("Login failed:", error);
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-10 justify-center  flex-col">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full max-w-md p-6 bg-white rounded-lg shadow-md"
        >
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              {...register("email", { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">Email is required.</p>
            )}
          </div>
          <div className="mb-6">
            <label
              htmlFor="password"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              {...register("password", { required: "Password is required." })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-gray-500"
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="px-6 cursor-pointer py-3 text-lg font-semibold bg-gray-400 text-black/50 hover:text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Login as Teacher
          </button>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default teacherPage;
