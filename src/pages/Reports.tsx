import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";

interface ReportData {
  monthlyTrends: any[];
  vegNonVegSales: any[];
  topDishes: any[];
  categoryBreakdown: any[];
  dailyRevenue: any[];
}

const Reports = () => {
  const [reportData, setReportData] = useState<ReportData>({
    monthlyTrends: [],
    vegNonVegSales: [],
    topDishes: [],
    categoryBreakdown: [],
    dailyRevenue: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      // Fetch transactions with dish details
      const { data: transactions } = await supabase
        .from('transactions')
        .select(`
          *,
          dishes(name, type, categories(name))
        `);

      // Fetch dishes data
      const { data: dishes } = await supabase
        .from('dishes')
        .select(`
          *,
          categories(name, icon),
          transactions(*)
        `);

      if (transactions && dishes) {
        processReportData(transactions, dishes);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const processReportData = (transactions: any[], dishes: any[]) => {
    // Monthly trends
    const monthlyData = processMonthlyTrends(transactions);
    
    // Veg vs Non-Veg sales
    const vegNonVegData = processVegNonVegSales(transactions);
    
    // Top selling dishes
    const topDishesData = processTopDishes(transactions);
    
    // Category breakdown
    const categoryData = processCategoryBreakdown(dishes);
    
    // Daily revenue (last 7 days)
    const dailyData = processDailyRevenue(transactions);

    setReportData({
      monthlyTrends: monthlyData,
      vegNonVegSales: vegNonVegData,
      topDishes: topDishesData,
      categoryBreakdown: categoryData,
      dailyRevenue: dailyData
    });
  };

  const processMonthlyTrends = (transactions: any[]) => {
    const monthlyMap = new Map();
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { month: monthKey, income: 0, expense: 0 });
      }
      
      const monthData = monthlyMap.get(monthKey);
      if (transaction.type === 'income') {
        monthData.income += Number(transaction.amount);
      } else {
        monthData.expense += Number(transaction.amount);
      }
    });
    
    return Array.from(monthlyMap.values()).sort((a, b) => a.month.localeCompare(b.month));
  };

  const processVegNonVegSales = (transactions: any[]) => {
    let vegSales = 0;
    let nonVegSales = 0;
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income' && transaction.dishes) {
        if (transaction.dishes.type === 'veg') {
          vegSales += Number(transaction.amount);
        } else if (transaction.dishes.type === 'non_veg') {
          nonVegSales += Number(transaction.amount);
        }
      }
    });
    
    const total = vegSales + nonVegSales;
    return [
      { 
        name: "Veg Items", 
        value: vegSales, 
        percentage: total > 0 ? Math.round((vegSales / total) * 100) : 0,
        color: "hsl(var(--veg))" 
      },
      { 
        name: "Non-Veg Items", 
        value: nonVegSales, 
        percentage: total > 0 ? Math.round((nonVegSales / total) * 100) : 0,
        color: "hsl(var(--non-veg))" 
      }
    ];
  };

  const processTopDishes = (transactions: any[]) => {
    const dishSales = new Map();
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income' && transaction.dishes) {
        const dishName = transaction.dishes.name;
        if (!dishSales.has(dishName)) {
          dishSales.set(dishName, {
            name: dishName,
            sales: 0,
            quantity: 0,
            type: transaction.dishes.type
          });
        }
        
        const dish = dishSales.get(dishName);
        dish.sales += Number(transaction.amount);
        dish.quantity += transaction.quantity || 1;
      }
    });
    
    return Array.from(dishSales.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  };

  const processCategoryBreakdown = (dishes: any[]) => {
    const categoryMap = new Map();
    
    dishes.forEach(dish => {
      const categoryName = dish.categories?.name || 'Uncategorized';
      if (!categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, {
          name: categoryName,
          dishes: 0,
          vegCount: 0,
          nonVegCount: 0
        });
      }
      
      const category = categoryMap.get(categoryName);
      category.dishes += 1;
      if (dish.type === 'veg') {
        category.vegCount += 1;
      } else {
        category.nonVegCount += 1;
      }
    });
    
    return Array.from(categoryMap.values());
  };

  const processDailyRevenue = (transactions: any[]) => {
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      
      const dayRevenue = transactions
        .filter(t => t.type === 'income' && t.transaction_date.startsWith(dateKey))
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      last7Days.push({
        date: date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }),
        revenue: dayRevenue
      });
    }
    
    return last7Days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-muted-foreground">Generating reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-2">
          📊 Reports & Analytics
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Insights into your restaurant performance</p>
      </div>

      {/* Monthly Trends */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base md:text-lg">
            <span className="text-base md:text-lg">📈</span>
            Monthly Income vs Expenses
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 md:p-6">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={reportData.monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, ""]} />
              <Legend />
              <Bar dataKey="income" fill="hsl(var(--income))" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="hsl(var(--expense))" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Veg vs Non-Veg Sales & Daily Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="text-base md:text-lg">🥘</span>
              Veg vs Non-Veg Revenue
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={reportData.vegNonVegSales}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name} ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {reportData.vegNonVegSales.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, ""]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-veg rounded-full"></div>
                <span className="text-sm">🌿 Veg: ₹{reportData.vegNonVegSales[0]?.value.toLocaleString() || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-non-veg rounded-full"></div>
                <span className="text-sm">🍗 Non-Veg: ₹{reportData.vegNonVegSales[1]?.value.toLocaleString() || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="text-base md:text-lg">📅</span>
              Daily Revenue (Last 7 Days)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 md:p-6">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={reportData.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Dishes & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="text-base md:text-lg">🏆</span>
              Top Selling Dishes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              {reportData.topDishes.map((dish, index) => (
                <div key={dish.name} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{dish.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant={dish.type === 'veg' ? 'secondary' : 'destructive'} className="text-xs">
                          {dish.type === 'veg' ? '🌿 Veg' : '🍗 Non-Veg'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {dish.quantity} orders
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary">₹{dish.sales.toLocaleString()}</p>
                  </div>
                </div>
              ))}
              {reportData.topDishes.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">🍽️</div>
                  <p>No sales data available</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <span className="text-base md:text-lg">📋</span>
              Category Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 md:space-y-4">
              {reportData.categoryBreakdown.map((category) => (
                <div key={category.name} className="p-4 bg-secondary rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{category.name}</h4>
                    <span className="text-sm font-bold">{category.dishes} dishes</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-veg rounded-full"></div>
                      <span className="text-sm">🌿 {category.vegCount} Veg</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-non-veg rounded-full"></div>
                      <span className="text-sm">🍗 {category.nonVegCount} Non-Veg</span>
                    </div>
                  </div>
                </div>
              ))}
              {reportData.categoryBreakdown.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-4xl mb-2">📂</div>
                  <p>No categories found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;