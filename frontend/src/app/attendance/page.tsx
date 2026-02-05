"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { CheckCircle2, XCircle, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetcher } from "@/lib/api";
import { toast } from "sonner";

interface Employee {
  id: string;
  full_name: string;
  employee_id: string;
}

interface Attendance {
  id: number;
  employee: string; // ID
  employee_name: string;
  date: string;
  status: "Present" | "Absent";
}

export default function AttendancePage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState("Present");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [empData, attData] = await Promise.all([
        fetcher("/employees/"),
        fetcher("/attendance/"),
      ]);
      setEmployees(empData);
      setAttendance(attData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return toast.error("Select an employee");
    
    setSubmitting(true);
    try {
      const newRecord = await fetcher("/attendance/", {
        method: "POST",
        body: JSON.stringify({
           employee: selectedEmployee,
           date: date,
           status: status
        })
      });
      setAttendance([newRecord, ...attendance]);
      toast.success("Attendance marked successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to mark attendance");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
        <p className="text-muted-foreground">Track daily attendance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Mark Attendance Form */}
        <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 shadow-sm sticky top-6">
                <h2 className="text-lg font-semibold mb-4">Mark Attendance</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Employee</label>
                        <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={selectedEmployee}
                            onChange={(e) => setSelectedEmployee(e.target.value)}
                            required
                        >
                            <option value="">Select Employee</option>
                            {employees.map(e => (
                                <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Date</label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Status</label>
                        <div className="flex gap-2">
                            <button
                                type="button" 
                                onClick={() => setStatus("Present")}
                                className={cn(
                                    "flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-all",
                                    status === "Present" 
                                        ? "bg-green-500/10 border-green-500/50 text-green-600" 
                                        : "bg-background border-input hover:bg-accent"
                                )}
                            >
                                Present
                            </button>
                            <button
                                type="button" 
                                onClick={() => setStatus("Absent")}
                                className={cn(
                                    "flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-all",
                                    status === "Absent" 
                                        ? "bg-red-500/10 border-red-500/50 text-red-600" 
                                        : "bg-background border-input hover:bg-accent"
                                )}
                            >
                                Absent
                            </button>
                        </div>
                    </div>
                    <Button type="submit" className="w-full" isLoading={submitting}>
                        Submit
                    </Button>
                </form>
            </div>
        </div>

        {/* Attendance List */}
        <div className="lg:col-span-2">
            <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-border bg-muted/30">
                    <h3 className="font-semibold">Recent Records</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/50 border-b border-border">
                            <tr>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Employee</th>
                                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {loading ? (
                                <tr><td colSpan={3} className="p-8 text-center">Loading...</td></tr>
                            ) : attendance.length === 0 ? (
                                <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No records found.</td></tr>
                            ) : (
                                attendance.map(item => (
                                    <tr key={item.id} className="hover:bg-muted/50">
                                        <td className="px-4 py-3 font-medium">{item.date}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{item.employee_name}</div>
                                            {/* We can show ID too if we match from employees list, but backend response has employee_name */}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium",
                                                item.status === "Present" 
                                                    ? "bg-green-500/10 text-green-600" 
                                                    : "bg-red-500/10 text-red-600"
                                            )}>
                                                {item.status === "Present" ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                                                {item.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
