import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Pencil, Trash2, CalendarIcon, Search } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Worker {
  id: string;
  name: string;
  designation: string;
  payment: number;
  created_at: string;
  updated_at: string;
}

const Workers = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    designation: "",
    payment: "",
    payment_date: new Date(),
  });
  const [searchName, setSearchName] = useState("");
  const [filterMonth, setFilterMonth] = useState<Date | undefined>();

  const { data: workers, isLoading } = useQuery({
    queryKey: ["workers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("workers")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as Worker[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newWorker: { name: string; designation: string; payment: number; created_at: string }) => {
      const { error } = await supabase.from("workers").insert([newWorker]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast({ title: "Worker added successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to add worker", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; designation: string; payment: number; created_at: string } }) => {
      const { error } = await supabase.from("workers").update(data).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast({ title: "Worker updated successfully" });
      resetForm();
    },
    onError: () => {
      toast({ title: "Failed to update worker", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("workers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workers"] });
      toast({ title: "Worker deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete worker", variant: "destructive" });
    },
  });

  const resetForm = () => {
    setFormData({ name: "", designation: "", payment: "", payment_date: new Date() });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payment = parseFloat(formData.payment);
    
    if (!formData.name || !formData.designation || isNaN(payment)) {
      toast({ title: "Please fill all fields correctly", variant: "destructive" });
      return;
    }

    const paymentData = {
      name: formData.name,
      designation: formData.designation,
      payment,
      created_at: formData.payment_date.toISOString(),
    };

    if (isEditing && editingId) {
      updateMutation.mutate({
        id: editingId,
        data: paymentData,
      });
    } else {
      createMutation.mutate(paymentData);
    }
  };

  const handleEdit = (worker: Worker) => {
    setFormData({
      name: worker.name,
      designation: worker.designation,
      payment: worker.payment.toString(),
      payment_date: new Date(worker.created_at),
    });
    setIsEditing(true);
    setEditingId(worker.id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this worker?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredWorkers = useMemo(() => {
    if (!workers) return [];
    
    return workers.filter((worker) => {
      const matchesName = searchName
        ? worker.name.toLowerCase().includes(searchName.toLowerCase())
        : true;
      
      const matchesMonth = filterMonth
        ? format(new Date(worker.created_at), "MM-yyyy") === format(filterMonth, "MM-yyyy")
        : true;
      
      return matchesName && matchesMonth;
    });
  }, [workers, searchName, filterMonth]);

  const totalPayment = useMemo(() => {
    return filteredWorkers.reduce((sum, worker) => sum + Number(worker.payment), 0);
  }, [filteredWorkers]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Workers Payment</h1>
        <p className="text-muted-foreground">Manage worker information and payments</p>
      </div>

      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? "Edit Worker" : "Add New Worker"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="name">Worker Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter worker name"
                  />
                </div>
                <div>
                  <Label htmlFor="designation">Designation</Label>
                  <Input
                    id="designation"
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="Enter designation"
                  />
                </div>
                <div>
                  <Label htmlFor="payment">Payment Amount</Label>
                  <Input
                    id="payment"
                    type="number"
                    step="0.01"
                    value={formData.payment}
                    onChange={(e) => setFormData({ ...formData, payment: e.target.value })}
                    placeholder="Enter payment amount"
                  />
                </div>
                <div>
                  <Label>Payment Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !formData.payment_date && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.payment_date ? format(formData.payment_date, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.payment_date}
                        onSelect={(date) => date && setFormData({ ...formData, payment_date: date })}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {isEditing ? "Update Worker" : <><Plus className="mr-2 h-4 w-4" /> Add Worker</>}
                </Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle>Workers List</CardTitle>
            <div className="flex items-center gap-4 text-lg font-semibold">
              <span className="text-muted-foreground">Total Payment:</span>
              <span className="text-primary">₹{totalPayment.toFixed(2)}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="search">Search by Name</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  value={searchName}
                  onChange={(e) => setSearchName(e.target.value)}
                  placeholder="Search worker name..."
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex-1">
              <Label>Filter by Month</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filterMonth && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterMonth ? format(filterMonth, "MMMM yyyy") : <span>Select month</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filterMonth}
                    onSelect={setFilterMonth}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            {(searchName || filterMonth) && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchName("");
                    setFilterMonth(undefined);
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
          {isLoading ? (
            <p>Loading...</p>
          ) : filteredWorkers && filteredWorkers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Payment Date</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredWorkers.map((worker) => (
                    <TableRow key={worker.id}>
                      <TableCell className="font-medium">{worker.name}</TableCell>
                      <TableCell>{worker.designation}</TableCell>
                      <TableCell>₹{worker.payment.toFixed(2)}</TableCell>
                      <TableCell>{format(new Date(worker.created_at), "PPP")}</TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(worker)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(worker.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground">No workers found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Workers;
