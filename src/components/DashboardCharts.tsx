import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ComposedChart, Line } from "recharts";

interface DashboardChartsProps {
  vegNonVegData: Array<{ name: string; value: number; color: string }>;
  monthlyData: Array<{ month: string; income: number; expense: number }>;
  dailyData?: Array<{ day: string; income: number; expense: number; workers: number }>;
}

const DashboardCharts = ({ vegNonVegData, monthlyData, dailyData = [] }: DashboardChartsProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 md:gap-6">
      {/* Veg vs Non-Veg Sales */}
      <Card className="hover-lift border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-bold">
            <span className="text-2xl">🥘</span>
            Veg vs Non-Veg Sales
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={vegNonVegData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
                strokeWidth={0}
              >
                {vegNonVegData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-veg rounded-full shadow-sm"></div>
              <span className="text-sm font-medium">🌿 Veg Items</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-non-veg rounded-full shadow-sm"></div>
              <span className="text-sm font-medium">🍗 Non-Veg Items</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income vs Expenses */}
      <Card className="hover-lift border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-bold">
            <span className="text-2xl">📈</span>
            Monthly Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip 
                formatter={(value) => [`₹${value}`, ""]}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }}
              />
              <Legend />
              <Bar dataKey="income" fill="hsl(var(--income))" name="Income" radius={[8, 8, 0, 0]} />
              <Bar dataKey="expense" fill="hsl(var(--expense))" name="Expenses" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* This Month: Daily Income, Expenses, Workers Payments */}
      <Card className="hover-lift border-0 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-bold">
            <span className="text-2xl">📅</span>
            This Month - Daily (Income, Expenses, Workers)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" stroke="hsl(var(--foreground))" />
              <YAxis stroke="hsl(var(--foreground))" />
              <Tooltip formatter={(value, name) => [`₹${Number(value).toLocaleString()}`, name]} />
              <Legend />
              <Bar dataKey="workers" name="Workers" fill="hsl(var(--expense))" radius={[6,6,0,0]} />
              <Line type="monotone" dataKey="income" name="Income" stroke="hsl(var(--income))" strokeWidth={3} dot={false} />
              <Line type="monotone" dataKey="expense" name="Expenses" stroke="hsl(var(--destructive))" strokeWidth={3} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;
