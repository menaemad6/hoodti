import React from "react";
import { TrendingUp } from "lucide-react";
import { 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import ModernCard from "@/components/ui/modern-card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";

interface RevenueChartProps {
  data: Array<{ month: string; revenue: number }>;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const renderTooltipContent = ({ active, payload }: { active: any; payload: any }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Month
              </span>
              <span className="font-bold text-muted-foreground">
                {payload[0].payload.month}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Revenue
              </span>
              <span className="font-bold">
                ${payload[0].value.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ModernCard className="overflow-hidden">
      <CardHeader className="pb-1">
        <CardTitle className="flex items-center">
          <TrendingUp className="mr-2 h-5 w-5" />
          Revenue Trend
        </CardTitle>
        <CardDescription>
          Monthly revenue for the current year
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="99%" height="99%">
            <LineChart data={data} margin={{ top: 5, right: 5, bottom: 15, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis 
                dataKey="month" 
                stroke="#888888" 
                fontSize={12} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                domain={[0, 'dataMax + 1000']}
                tickFormatter={(value) => `$${value}`}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 8 }}
                isAnimationActive={false}
              />
              <RechartsTooltip content={renderTooltipContent} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </ModernCard>
  );
};

export default RevenueChart;
