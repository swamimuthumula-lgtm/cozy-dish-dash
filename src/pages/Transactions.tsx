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
import { Plus, TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  dish_id?: string;
  quantity?: number;
  transaction_date: string;
  dishes?: {
    name: string;
    type: 'veg' | 'non_veg';
  };
}

interface Dish {
  id: string;
  name: string;
  price: number;
  type: 'veg' | 'non_veg';
}

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: "income" as "income" | "expense",
    amount: "",
    description: "",
    dish_id: "",
    quantity: "1"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsResult, dishesResult] = await Promise.all([
        supabase.from('transactions').select(`
          *,
          dishes(name, type)
        `).order('transaction_date', { ascending: false }),
        supabase.from('dishes').select('id, name, price, type').eq('is_available', true)
      ]);

      if (transactionsResult.data) setTransactions(transactionsResult.data);
      if (dishesResult.data) setDishes(dishesResult.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error",
        description: "Failed to load transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const transactionData = {
        type: formData.type,
        amount: parseFloat(formData.amount),
        description: formData.description,
        dish_id: formData.dish_id || null,
        quantity: formData.dish_id ? parseInt(formData.quantity) : null
      };

      const { error } = await supabase
        .from('transactions')
        .insert([transactionData]);
      
      if (error) throw error;
      
      toast({
        title: "Success! 🎉",
        description: `${formData.type === 'income' ? 'Income' : 'Expense'} recorded successfully`,
      });

      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving transaction:', error);
      toast({
        title: "Error",
        description: "Failed to save transaction",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      type: "income",
      amount: "",
      description: "",
      dish_id: "",
      quantity: "1"
    });
    setIsAddDialogOpen(false);
  };

  const calculateStats = () => {
    const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
    const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);
    return { income, expenses, profit: income - expenses };
  };

  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">💸</div>
          <p className="text-muted-foreground">Loading transactions...</p>
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
            <span className="text-4xl">💸</span>
            Transactions
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2 font-medium">Track your income and expenses</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient" className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">Transaction Type</Label>
                <Select value={formData.type} onValueChange={(value: "income" | "expense") => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">💰 Income</SelectItem>
                    <SelectItem value="expense">💸 Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="What is this transaction for?"
                  rows={2}
                  required
                />
              </div>
              
              {formData.type === 'income' && (
                <>
                  <div>
                    <Label htmlFor="dish">Related Dish (Optional)</Label>
                    <Select value={formData.dish_id} onValueChange={(value) => setFormData({...formData, dish_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dish (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">No specific dish</SelectItem>
                        {dishes.map((dish) => (
                          <SelectItem key={dish.id} value={dish.id}>
                            {dish.type === 'veg' ? '🌿' : '🍗'} {dish.name} - ₹{dish.price}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {formData.dish_id && (
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                        min="1"
                        required
                      />
                    </div>
                  )}
                </>
              )}
              
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  Add Transaction
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <Card className="hover-lift border-0">
          <CardContent className="p-6 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Total Income</p>
                <p className="text-3xl md:text-4xl font-bold text-income">₹{stats.income.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-veg w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-veg">
                <TrendingUp className="h-7 w-7 md:h-8 md:w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-lift border-0">
          <CardContent className="p-6 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Total Expenses</p>
                <p className="text-3xl md:text-4xl font-bold text-expense">₹{stats.expenses.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-non-veg w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-non-veg">
                <TrendingDown className="h-7 w-7 md:h-8 md:w-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-lift sm:col-span-2 lg:col-span-1 border-0">
          <CardContent className="p-6 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Net Profit</p>
                <p className={`text-3xl md:text-4xl font-bold ${stats.profit >= 0 ? 'text-income' : 'text-expense'}`}>
                  ₹{stats.profit.toLocaleString()}
                </p>
              </div>
              <div className={cn(
                "w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center flex-shrink-0",
                stats.profit >= 0 ? 'bg-gradient-veg shadow-veg' : 'bg-gradient-non-veg shadow-non-veg'
              )}>
                <span className="text-white text-2xl md:text-3xl">
                  {stats.profit >= 0 ? '📈' : '📉'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              size="sm"
            >
              All Transactions
            </Button>
            <Button
              variant={filter === 'income' ? 'default' : 'outline'}
              onClick={() => setFilter('income')}
              size="sm"
            >
              💰 Income
            </Button>
            <Button
              variant={filter === 'expense' ? 'default' : 'outline'}
              onClick={() => setFilter('expense')}
              size="sm"
            >
              💸 Expenses
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <Calendar className="h-4 w-4 md:h-5 md:w-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 md:p-4 bg-secondary rounded-lg hover-lift">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    transaction.type === 'income' ? 'bg-income text-income-foreground' : 'bg-expense text-expense-foreground'
                  }`}>
                    <span className="text-base md:text-lg">{transaction.type === 'income' ? '💰' : '💸'}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm md:text-base truncate">{transaction.description}</p>
                    {transaction.dishes && (
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant={transaction.dishes.type === 'veg' ? 'secondary' : 'destructive'} className="text-xs">
                          {transaction.dishes.type === 'veg' ? '🌿 Veg' : '🍗 Non-Veg'}
                        </Badge>
                        <span className="text-xs md:text-sm text-muted-foreground truncate">
                          {transaction.dishes.name}
                          {transaction.quantity && transaction.quantity > 1 && ` x${transaction.quantity}`}
                        </span>
                      </div>
                    )}
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {new Date(transaction.transaction_date).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`text-base md:text-xl font-bold ${
                    transaction.type === 'income' ? 'text-income' : 'text-expense'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {filteredTransactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">💸</div>
                <p>No transactions found</p>
                <Button 
                  onClick={() => setIsAddDialogOpen(true)} 
                  className="mt-4 bg-gradient-warm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Transaction
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;