import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import KPICard from "@/components/KPICard";
import DashboardCharts from "@/components/DashboardCharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
  const [vegNonVegChartData, setVegNonVegChartData] = useState<any[]>([]);
  const [monthlyChartData, setMonthlyChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all transactions with dish details
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          *,
          dishes(name, type)
        `);

      if (!transactions) return;

      // Calculate income and expenses
      const income = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + Number(t.amount), 0);
      const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0);

      // Calculate veg vs non-veg sales revenue
      let vegRevenue = 0;
      let nonVegRevenue = 0;
      transactions.forEach(t => {
        if (t.type === 'income' && t.dishes) {
          if (t.dishes.type === 'veg') {
            vegRevenue += Number(t.amount);
          } else if (t.dishes.type === 'non_veg') {
            nonVegRevenue += Number(t.amount);
          }
        }
      });

      // Calculate monthly data
      const monthlyMap = new Map();
      transactions.forEach(t => {
        const date = new Date(t.transaction_date);
        const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
        
        if (!monthlyMap.has(monthKey)) {
          monthlyMap.set(monthKey, { month: monthKey, income: 0, expense: 0 });
        }
        
        const monthData = monthlyMap.get(monthKey);
        if (t.type === 'income') {
          monthData.income += Number(t.amount);
        } else {
          monthData.expense += Number(t.amount);
        }
      });

      // Fetch dish data
      const { data: dishes } = await supabase
        .from('dishes')
        .select('type');

      const vegCount = dishes?.filter(d => d.type === 'veg').length || 0;
      const nonVegCount = dishes?.filter(d => d.type === 'non_veg').length || 0;

      // Get recent transactions
      const recentTx = transactions
        .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
        .slice(0, 5);

      setStats({
        totalIncome: income,
        totalExpenses: expenses,
        profit: income - expenses,
        vegSales: vegCount,
        nonVegSales: nonVegCount,
        totalDishes: dishes?.length || 0
      });

      setVegNonVegChartData([
        { name: "Veg Items", value: vegRevenue, color: "hsl(var(--veg))" },
        { name: "Non-Veg Items", value: nonVegRevenue, color: "hsl(var(--non-veg))" }
      ]);

      setMonthlyChartData(Array.from(monthlyMap.values()));
      setRecentTransactions(recentTx);
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
    <div className="space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center mb-6 md:mb-10">
        <div className="inline-block mb-4">
          <div className="text-6xl md:text-7xl mb-2 animate-bounce">🍴</div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-3 bg-gradient-primary bg-clip-text text-transparent">
          Welcome to Dish Dash!
        </h1>
        <p className="text-base md:text-lg text-muted-foreground font-medium">
          Your modern restaurant management dashboard
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KPICard
          title="Total Income"
          value={`₹${stats.totalIncome.toLocaleString()}`}
          icon="💰"
          gradient="bg-gradient-veg"
        />
        <KPICard
          title="Total Expenses"
          value={`₹${stats.totalExpenses.toLocaleString()}`}
          icon="💸"
          gradient="bg-gradient-non-veg"
        />
        <KPICard
          title="Profit"
          value={`₹${stats.profit.toLocaleString()}`}
          icon="📈"
          gradient={stats.profit >= 0 ? "bg-gradient-veg" : "bg-gradient-non-veg"}
        />
        <KPICard
          title="Total Dishes"
          value={stats.totalDishes}
          icon="🍽️"
          gradient="bg-gradient-primary"
        />
      </div>

      {/* Veg vs Non-Veg Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <Card className="hover-lift border-0">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Veg Dishes</p>
                <p className="text-4xl md:text-5xl font-bold text-veg">{stats.vegSales}</p>
              </div>
              <div className="bg-gradient-veg w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-veg">
                🌿
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover-lift border-0">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">Non-Veg Dishes</p>
                <p className="text-4xl md:text-5xl font-bold text-non-veg">{stats.nonVegSales}</p>
              </div>
              <div className="bg-gradient-non-veg w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl shadow-non-veg">
                🍗
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <DashboardCharts vegNonVegData={vegNonVegChartData} monthlyData={monthlyChartData} />

      {/* Recent Transactions */}
      <Card className="hover-lift border-0">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-bold">
            <span className="text-2xl">⏰</span>
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 md:space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 md:p-5 bg-accent rounded-2xl hover-lift">
                <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
                  <div className={cn(
                    "w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md",
                    transaction.type === 'income' ? 'bg-gradient-veg' : 'bg-gradient-non-veg'
                  )}>
                    <span className="text-lg md:text-xl">{transaction.type === 'income' ? '💰' : '💸'}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm md:text-base truncate">{transaction.description}</p>
                    {transaction.dishes && (
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <Badge 
                          variant={transaction.dishes.type === 'veg' ? 'secondary' : 'destructive'} 
                          className="text-xs font-semibold"
                        >
                          {transaction.dishes.type === 'veg' ? '🌿 Veg' : '🍗 Non-Veg'}
                        </Badge>
                        <span className="text-xs md:text-sm text-muted-foreground font-medium truncate">{transaction.dishes.name}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className={cn(
                    "font-bold text-base md:text-lg",
                    transaction.type === 'income' ? 'text-income' : 'text-expense'
                  )}>
                    {transaction.type === 'income' ? '+' : '-'}₹{Number(transaction.amount).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground font-medium">
                    {new Date(transaction.transaction_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {recentTransactions.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <div className="text-6xl mb-4">🍽️</div>
                <p className="text-lg font-medium">No transactions yet. Start adding your first sale!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;