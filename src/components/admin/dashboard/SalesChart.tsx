import React from "react";
import { BarChart3 } from "lucide-react";
import { 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent 
} from "@/components/ui/card";
import ModernCard from "@/components/ui/modern-card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer
} from "recharts";

interface SalesChartProps {
  data: Array<{ name: string; sales: number }>;
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  const renderSalesTooltipContent = ({ active, payload }: { active: any; payload: any }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Day
              </span>
              <span className="font-bold text-muted-foreground">
                {payload[0].payload.name}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Sales
              </span>
              <span className="font-bold">
                {payload[0].value}
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
          <BarChart3 className="mr-2 h-5 w-5" />
          Weekly Sales
        </CardTitle>
        <CardDescription>
          Sales performance for the current week
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="99%" height="99%">
            <BarChart data={data} margin={{ top: 5, right: 5, bottom: 15, left: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="name"
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
                domain={[0, 'dataMax + 10']}
                tickFormatter={(value) => `${value}`}
              />
              <Bar
                dataKey="sales"
                fill="rgba(34, 197, 94, 0.6)"
                radius={[4, 4, 0, 0]}
                barSize={30}
                isAnimationActive={false}
              />
              <RechartsTooltip content={renderSalesTooltipContent} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </ModernCard>
  );
};

export default SalesChart;
