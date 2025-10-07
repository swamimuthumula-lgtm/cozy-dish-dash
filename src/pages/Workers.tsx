import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

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
  });

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
    mutationFn: async (newWorker: { name: string; designation: string; payment: number }) => {
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
    mutationFn: async ({ id, data }: { id: string; data: { name: string; designation: string; payment: number } }) => {
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
    setFormData({ name: "", designation: "", payment: "" });
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

    if (isEditing && editingId) {
      updateMutation.mutate({
        id: editingId,
        data: { name: formData.name, designation: formData.designation, payment },
      });
    } else {
      createMutation.mutate({ name: formData.name, designation: formData.designation, payment });
    }
  };

  const handleEdit = (worker: Worker) => {
    setFormData({
      name: worker.name,
      designation: worker.designation,
      payment: worker.payment.toString(),
    });
    setIsEditing(true);
    setEditingId(worker.id);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this worker?")) {
      deleteMutation.mutate(id);
    }
  };

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          <CardTitle>Workers List</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : workers && workers.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Designation</TableHead>
                    <TableHead>Payment</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workers.map((worker) => (
                    <TableRow key={worker.id}>
                      <TableCell className="font-medium">{worker.name}</TableCell>
                      <TableCell>{worker.designation}</TableCell>
                      <TableCell>₹{worker.payment.toFixed(2)}</TableCell>
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
