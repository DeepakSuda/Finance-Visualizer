"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    Home,
    CreditCard,
    BarChart3,
    PiggyBank,
    LayoutDashboard,
    Menu,
    X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const Navbar = () => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navigationItems = [
        {
            name: "Home",
            href: "/",
            icon: Home,
        },
        {
            name: "Dashboard",
            href: "/Dashboard",
            icon: LayoutDashboard,
        },
        {
            name: "Transactions",
            href: "/Transactions",
            icon: CreditCard,
        },
        {
            name: "Analytics",
            href: "/Analytics",
            icon: BarChart3,
        },
        {
            name: "Budget",
            href: "/Budget",
            icon: PiggyBank,
        },
    ];

    const isActive = (href: string) => {
        if (href === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(href);
    };

    return (
        <nav className="bg-white shadow-lg border-r border-gray-200 w-64 flex-shrink-0">
            {/* Desktop Navigation */}
            <div className="hidden md:flex flex-col h-full">
                {/* Logo/Brand */}
                <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">Finance Visualizer</h1>
                    <p className="text-sm text-gray-600">Manage your money wisely</p>
                </div>

                {/* Navigation Links */}
                <div className="flex-1 p-4">
                    <nav className="space-y-2">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200",
                                        isActive(item.href)
                                            ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                    )}
                                >
                                    <Icon className="h-5 w-5" />
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500 text-center">
                        © 2025 Finance Tracker
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
                {/* Mobile Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                    <h1 className="text-xl font-bold text-gray-900">Finance Tracker</h1>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="p-2"
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </Button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="border-b border-gray-200">
                        <nav className="p-4 space-y-2">
                            {navigationItems.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors duration-200",
                                            isActive(item.href)
                                                ? "bg-blue-50 text-blue-700"
                                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        {item.name}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;