"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Trash2, Plus, Search, UserPlus, X, FilePenLine } from "lucide-react";
import { cn } from "@/lib/utils";
import { fetcher, API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  email: string;
  department: string;
  created_at: string;
}

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    employee_id: "",
    email: "",
    department: "",
  });
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetcher("/employees/");
      setEmployees(data);
    } catch (err) {
      setError("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this employee?")) return;
    try {
      // Optimistic update
      setEmployees(prev => prev.filter(e => e.id !== id));
      await fetch(`${API_BASE_URL}/employees/${id}/`, { method: "DELETE" });
      toast.success("Employee deleted successfully");
    } catch (err) {
      toast.error("Failed to delete employee");
      loadEmployees(); // Revert
    }
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      full_name: employee.full_name,
      employee_id: employee.employee_id,
      email: employee.email,
      department: employee.department,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingEmployee(null);
    setFormData({ full_name: "", employee_id: "", email: "", department: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingEmployee) {
        // Update existing
        const updated = await fetcher(`/employees/${editingEmployee.id}/`, {
          method: "PUT",
          body: JSON.stringify(formData),
        });
        setEmployees(prev => prev.map(e => e.id === editingEmployee.id ? updated : e));
        toast.success("Employee updated successfully");
      } else {
        // Create new
        const newEmployee = await fetcher("/employees/", {
            method: "POST",
            body: JSON.stringify(formData),
        });
        setEmployees([newEmployee, ...employees]);
        toast.success("Employee created successfully");
      }
      closeModal();
    } catch (err: any) {
      toast.error(err.message || "Failed to save employee");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = employees.filter(e => 
    e.full_name.toLowerCase().includes(search.toLowerCase()) || 
    e.employee_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground">Manage your organization's workforce.</p>
        </div>
        <Button onClick={() => { setEditingEmployee(null); setIsModalOpen(true); }} className="gap-2">
            <UserPlus size={16} /> Add Employee
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
                placeholder="Search employees..." 
                className="pl-9" 
                value={search} 
                onChange={e => setSearch(e.target.value)}
            />
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
            <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b border-border">
                <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Employee ID</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Email</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Department</th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                {loading ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading employees...</td></tr>
                ) : filtered.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No employees found.</td></tr>
                ) : (
                    filtered.map((emp) => (
                    <tr key={emp.id} className="hover:bg-muted/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{emp.employee_id}</td>
                        <td className="px-4 py-3">{emp.full_name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{emp.email}</td>
                        <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                                {emp.department}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(emp)} className="text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                                <FilePenLine size={16} />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(emp.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 size={16} />
                            </Button>
                          </div>
                        </td>
                    </tr>
                    ))
                )}
            </tbody>
            </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card w-full max-w-md p-6 rounded-lg shadow-xl border border-border animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold">{editingEmployee ? "Edit Employee" : "Add New Employee"}</h2>
               <Button variant="ghost" size="sm" onClick={closeModal}><X size={18}/></Button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
               <div className="space-y-2">
                   <label className="text-sm font-medium">Full Name</label>
                   <Input required placeholder="John Doe" value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                       <label className="text-sm font-medium">Employee ID</label>
                       <Input required placeholder="EMP001" value={formData.employee_id} onChange={e => setFormData({...formData, employee_id: e.target.value})} />
                   </div>
                   <div className="space-y-2">
                       <label className="text-sm font-medium">Department</label>
                       <Input required placeholder="Engineering" value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})} />
                   </div>
               </div>
               <div className="space-y-2">
                   <label className="text-sm font-medium">Email</label>
                   <Input required type="email" placeholder="john@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
               </div>
               <div className="flex justify-end gap-2 mt-6">
                   <Button type="button" variant="ghost" onClick={closeModal}>Cancel</Button>
                   <Button type="submit" isLoading={submitting}>
                       {editingEmployee ? "Save Changes" : "Create Employee"}
                   </Button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
