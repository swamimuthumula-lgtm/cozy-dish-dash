import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import KPICard from "@/components/KPICard";
import DashboardCharts from "@/components/DashboardCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  profit: number;
  vegSales: number;
  nonVegSales: number;
  totalDishes: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalIncome: 0,
    totalExpenses: 0,
    profit: 0,
    vegSales: 0,
    nonVegSales: 0,
    totalDishes: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch transaction statistics
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*');

      // Calculate income and expenses
      const income = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      const expenses = transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Fetch dish data for veg/non-veg statistics
      const { data: dishes } = await supabase
        .from('dishes')
        .select('*, transactions(*)');

      const vegSales = dishes?.filter(d => d.type === 'veg').length || 0;
      const nonVegSales = dishes?.filter(d => d.type === 'non_veg').length || 0;

      // Get recent transactions with dish details
      const { data: recentTx } = await supabase
        .from('transactions')
        .select(`
          *,
          dishes(name, type)
        `)
        .order('transaction_date', { ascending: false })
        .limit(5);

      setStats({
        totalIncome: income,
        totalExpenses: expenses,
        profit: income - expenses,
        vegSales,
        nonVegSales,
        totalDishes: dishes?.length || 0
      });

      setRecentTransactions(recentTx || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">🍽️</div>
          <p className="text-muted-foreground">Loading your restaurant dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="text-center mb-4 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
          Welcome to Dish Dash! 🍴
        </h1>
        <p className="text-base md:text-lg text-muted-foreground">
          Your cozy restaurant management dashboard
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KPICard
          title="Total Income"
          value={`₹${stats.totalIncome.toLocaleString()}`}
          icon="💰"
          gradient="bg-gradient-to-br from-income to-green-600"
          trend={{ value: 12, isPositive: true }}
        />
        <KPICard
          title="Total Expenses"
          value={`₹${stats.totalExpenses.toLocaleString()}`}
          icon="💸"
          gradient="bg-gradient-to-br from-expense to-red-600"
          trend={{ value: 5, isPositive: false }}
        />
        <KPICard
          title="Profit"
          value={`₹${stats.profit.toLocaleString()}`}
          icon="📈"
          gradient={stats.profit >= 0 ? "bg-gradient-to-br from-income to-green-600" : "bg-gradient-to-br from-expense to-red-600"}
          trend={{ value: 8, isPositive: stats.profit >= 0 }}
        />
        <KPICard
          title="Total Dishes"
          value={stats.totalDishes}
          icon="🍽️"
          gradient="bg-gradient-warm"
        />
      </div>

      {/* Veg vs Non-Veg Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="hover-lift">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Veg Dishes</p>
                <p className="text-2xl md:text-3xl font-bold text-veg">{stats.vegSales}</p>
              </div>
              <div className="bg-gradient-veg w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-xl md:text-2xl">
                🌿
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-lift">
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs md:text-sm font-medium text-muted-foreground">Non-Veg Dishes</p>
                <p className="text-2xl md:text-3xl font-bold text-non-veg">{stats.nonVegSales}</p>
              </div>
              <div className="bg-gradient-non-veg w-12 h-12 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-xl md:text-2xl">
                🍗
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <DashboardCharts />

      {/* Recent Transactions */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <span className="text-base md:text-lg">⏰</span>
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-3 md:p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    transaction.type === 'income' ? 'bg-income text-income-foreground' : 'bg-expense text-expense-foreground'
                  }`}>
                    <span className="text-sm md:text-base">{transaction.type === 'income' ? '💰' : '💸'}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-sm md:text-base truncate">{transaction.description}</p>
                    {transaction.dishes && (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={transaction.dishes.type === 'veg' ? 'secondary' : 'destructive'} className="text-xs">
                          {transaction.dishes.type === 'veg' ? '🌿 Veg' : '🍗 Non-Veg'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{transaction.dishes.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <p className={`font-bold text-sm md:text-base ${
                    transaction.type === 'income' ? 'text-income' : 'text-expense'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
                  </p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-4xl mb-2">🍽️</div>
                <p>No transactions yet. Start adding your first sale!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;