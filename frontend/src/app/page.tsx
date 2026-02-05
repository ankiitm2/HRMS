"use client";

import { useEffect, useState } from "react";
import { fetcher } from "@/lib/api";
import { Users, CalendarCheck, UserCheck, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const [stats, setStats] = useState({ 
      totalEmployees: 0, 
      presentToday: 0, 
      totalRecords: 0 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [employees, attendance] = await Promise.all([
          fetcher("/employees/"),
          fetcher("/attendance/"),
        ]);
        
        const today = new Date().toISOString().split('T')[0];
        const presentToday = attendance.filter((a: any) => a.date === today && a.status === 'Present').length;

        setStats({
          totalEmployees: employees.length,
          presentToday: presentToday,
          totalRecords: attendance.length
        });
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const cards = [
    {
        title: "Total Employees",
        value: stats.totalEmployees,
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-100/50",
        href: "/employees"
    },
    {
        title: "Present Today",
        value: stats.presentToday,
        icon: UserCheck,
        color: "text-green-600",
        bg: "bg-green-100/50",
        href: "/attendance"
    },
    {
        title: "Total Records",
        value: stats.totalRecords,
        icon: CalendarCheck,
        color: "text-purple-600",
        bg: "bg-purple-100/50",
        href: "/attendance"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent w-fit">
            Welcome to HRMS Lite
        </h1>
        <p className="text-lg text-muted-foreground mt-2">
            Manage your employees and attendance efficiently.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
            <Link key={i} href={card.href} className="group block">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                    <div className="flex items-center justify-between mb-4">
                        <div className={cn("p-3 rounded-lg", card.bg)}>
                            <card.icon className={cn("w-6 h-6", card.color)} />
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <h3 className="text-sm font-medium text-muted-foreground">{card.title}</h3>
                    <div className="text-3xl font-bold mt-1">
                        {loading ? "-" : card.value}
                    </div>
                </div>
            </Link>
        ))}
      </div>
      
      <div className="bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/10 rounded-xl p-8 text-center">
            <h3 className="text-xl font-semibold mb-2">Ready to get started?</h3>
            <p className="text-muted-foreground mb-6">Add your first employee or mark attendance for today.</p>
            <div className="flex justify-center gap-4">
                <Link href="/employees" className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm">
                    Manage Employees
                </Link>
            </div>
      </div>
    </div>
  );
}
