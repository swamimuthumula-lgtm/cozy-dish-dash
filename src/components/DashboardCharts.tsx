import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

const vegNonVegData = [
  { name: "Veg Items", value: 65, color: "hsl(var(--veg))" },
  { name: "Non-Veg Items", value: 35, color: "hsl(var(--non-veg))" }
];

const monthlyData = [
  { month: "Jan", income: 12000, expense: 8000 },
  { month: "Feb", income: 15000, expense: 9000 },
  { month: "Mar", income: 18000, expense: 10000 },
  { month: "Apr", income: 16000, expense: 8500 },
  { month: "May", income: 20000, expense: 11000 },
  { month: "Jun", income: 22000, expense: 12000 },
];

const DashboardCharts = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Veg vs Non-Veg Sales */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">🥘</span>
            Veg vs Non-Veg Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={vegNonVegData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {vegNonVegData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-veg rounded-full"></div>
              <span className="text-sm">🌿 Veg Items</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-non-veg rounded-full"></div>
              <span className="text-sm">🍗 Non-Veg Items</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Income vs Expenses */}
      <Card className="hover-lift">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="text-lg">📈</span>
            Monthly Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => [`₹${value}`, ""]} />
              <Legend />
              <Bar dataKey="income" fill="hsl(var(--income))" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" fill="hsl(var(--expense))" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardCharts;