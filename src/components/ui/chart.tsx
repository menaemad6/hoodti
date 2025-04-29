import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  TooltipProps,
  Legend
} from 'recharts';

interface ChartProps {
  data: any[];
  type?: 'line' | 'bar' | 'pie';
  height?: number | string;
  width?: number | string;
  xAxisDataKey?: string;
  yAxisDataKey?: string;
  dataKey: string;
  children?: React.ReactNode;
  [key: string]: any;
}

export function Chart({
  data,
  type = 'line',
  height = 300,
  width = '100%',
  xAxisDataKey = 'name',
  dataKey,
  children,
  ...props
}: ChartProps) {
  return (
    <ResponsiveContainer width={width} height={height}>
      {type === 'line' ? (
        <LineChart data={data} {...props}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisDataKey} />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke="#8884d8" 
            activeDot={{ r: 8 }} 
          />
          {children}
        </LineChart>
      ) : type === 'bar' ? (
        <BarChart data={data} {...props}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisDataKey} />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey={dataKey} fill="#8884d8" />
          {children}
        </BarChart>
      ) : (
        <PieChart {...props}>
          <Pie 
            data={data} 
            dataKey={dataKey} 
            nameKey={xAxisDataKey} 
            cx="50%" 
            cy="50%" 
            outerRadius={80} 
            fill="#8884d8" 
            label 
          />
          <RechartsTooltip />
          <Legend />
          {children}
        </PieChart>
      )}
    </ResponsiveContainer>
  );
}

interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
}

export function ChartContainer({
  children,
  className = "",
}: ChartContainerProps) {
  return (
    <div className={`h-80 w-full ${className}`}>
      {children}
    </div>
  );
}

export interface ChartTooltipProps {
  className?: string;
  children?: React.ReactNode;
  content?: React.ComponentType<any>;
}

export function ChartTooltip({ className, children, content }: ChartTooltipProps) {
  return <div className={className}>{content ? React.createElement(content) : children}</div>;
}

export function ChartTooltipContent({ className, children }: ChartContainerProps) {
  return (
    <div
      className={`rounded-lg border bg-background p-2 shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}

export default Chart;
