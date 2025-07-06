"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Home = () => {
  const [userName, setUserName] = useState("");

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Finance Visualizer
        </h1>
        {userName && (
          <p className="text-2xl text-blue-600 mb-4">
            Hello, {userName}! 👋
          </p>
        )}
        <p className="text-xl text-gray-600 mb-8">
          Track your expenses, analyze spending patterns, and manage your budget with powerful visualizations.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            className="w-full sm:w-64 h-12"
          />

          <Link href="/Dashboard">
            <Button size="lg" className="px-8 h-12 cursor-pointer">
              Go to Dashboard
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Track Transactions</h3>
            <p className="text-gray-600">Monitor your income and expenses in real-time</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Analytics</h3>
            <p className="text-gray-600">Get insights into your spending habits and trends</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Budget Planning</h3>
            <p className="text-gray-600">Set and track your financial goals effectively</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;