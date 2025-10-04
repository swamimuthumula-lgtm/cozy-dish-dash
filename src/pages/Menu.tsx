import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Dish {
  id: string;
  name: string;
  price: number;
  type: 'veg' | 'non_veg';
  description?: string;
  image_url?: string;
  is_available: boolean;
  category_id?: string;
  categories?: { name: string; icon: string };
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

const Menu = () => {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    type: "veg" as "veg" | "non_veg",
    description: "",
    category_id: "",
    is_available: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [dishesResult, categoriesResult] = await Promise.all([
        supabase.from('dishes').select(`
          *,
          categories(name, icon)
        `).order('name'),
        supabase.from('categories').select('*').order('name')
      ]);

      if (dishesResult.data) setDishes(dishesResult.data);
      if (categoriesResult.data) setCategories(categoriesResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load menu data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const dishData = {
        name: formData.name,
        price: parseFloat(formData.price),
        type: formData.type,
        description: formData.description || null,
        category_id: formData.category_id || null,
        is_available: formData.is_available
      };

      if (editingDish) {
        const { error } = await supabase
          .from('dishes')
          .update(dishData)
          .eq('id', editingDish.id);
        
        if (error) throw error;
        
        toast({
          title: "Success! 🎉",
          description: "Dish updated successfully",
        });
      } else {
        const { error } = await supabase
          .from('dishes')
          .insert([dishData]);
        
        if (error) throw error;
        
        toast({
          title: "Success! 🎉",
          description: "New dish added to menu",
        });
      }

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving dish:', error);
      toast({
        title: "Error",
        description: "Failed to save dish",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dish?')) return;

    try {
      const { error } = await supabase
        .from('dishes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      toast({
        title: "Deleted",
        description: "Dish removed from menu",
      });
      
      fetchData();
    } catch (error) {
      console.error('Error deleting dish:', error);
      toast({
        title: "Error",
        description: "Failed to delete dish",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      price: dish.price.toString(),
      type: dish.type,
      description: dish.description || "",
      category_id: dish.category_id || "",
      is_available: dish.is_available
    });
    setIsAddDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      price: "",
      type: "veg",
      description: "",
      category_id: "",
      is_available: true
    });
    setEditingDish(null);
    setIsAddDialogOpen(false);
  };

  const filteredDishes = dishes.filter(dish => {
    const matchesSearch = dish.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || dish.category_id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-3">
            <span className="text-4xl">🍽️</span>
            Menu Management
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Manage your delicious dishes</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Dish
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingDish ? "Edit Dish" : "Add New Dish"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Dish Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter dish name"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="price">Price (₹)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="type">Type</Label>
                <Select value={formData.type} onValueChange={(value: "veg" | "non_veg") => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="veg">🌿 Vegetarian</SelectItem>
                    <SelectItem value="non_veg">🍗 Non-Vegetarian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category_id} onValueChange={(value) => setFormData({...formData, category_id: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Describe your dish..."
                  rows={3}
                />
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({...formData, is_available: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="available">Available for orders</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingDish ? "Update Dish" : "Add Dish"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="border-0">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search dishes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 rounded-xl border-2"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-56 h-12 rounded-xl border-2">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Dishes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 md:gap-6">
        {filteredDishes.map((dish) => (
          <Card key={dish.id} className="hover-lift border-0 overflow-hidden">
            <CardHeader className="pb-4 bg-gradient-to-br from-accent/50 to-transparent">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-xl font-bold mb-3 truncate">{dish.name}</CardTitle>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge 
                      variant={dish.type === 'veg' ? 'secondary' : 'destructive'}
                      className="font-semibold"
                    >
                      {dish.type === 'veg' ? '🌿 Veg' : '🍗 Non-Veg'}
                    </Badge>
                    {dish.categories && (
                      <Badge variant="outline" className="font-medium">
                        {dish.categories.icon} {dish.categories.name}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 rounded-xl"
                    onClick={() => handleEdit(dish)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    className="h-9 w-9 rounded-xl"
                    onClick={() => handleDelete(dish.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {dish.description && (
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                  {dish.description}
                </p>
              )}
              <div className="flex items-center justify-between pt-2 border-t">
                <div className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  ₹{dish.price.toLocaleString()}
                </div>
                <Badge 
                  variant={dish.is_available ? "default" : "secondary"}
                  className="font-semibold"
                >
                  {dish.is_available ? "Available" : "Unavailable"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDishes.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-4xl mb-4">🍽️</div>
            <h3 className="text-lg font-semibold mb-2">No dishes found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== "all"
                ? "Try adjusting your filters"
                : "Start by adding your first delicious dish!"}
            </p>
            {(!searchTerm && selectedCategory === "all") && (
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-gradient-warm">
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Dish
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Menu;