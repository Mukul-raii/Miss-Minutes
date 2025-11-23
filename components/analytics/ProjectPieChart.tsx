"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Pie, PieChart, Cell, Legend } from "recharts";

interface ProjectPieChartProps {
  projects: Array<{
    id: string;
    name: string;
    totalDuration: number;
  }>;
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ProjectPieChart({ projects }: ProjectPieChartProps) {
  const totalTime = projects.reduce((acc, p) => acc + p.totalDuration, 0);

  const chartData = projects.slice(0, 5).map((project, index) => ({
    name: project.name,
    value: project.totalDuration / 3600, // Convert to hours
    percentage: ((project.totalDuration / totalTime) * 100).toFixed(1),
    fill: COLORS[index % COLORS.length],
  }));

  const chartConfig = chartData.reduce((acc, item, index) => {
    acc[item.name] = {
      label: item.name,
      color: COLORS[index % COLORS.length],
    };
    return acc;
  }, {} as ChartConfig);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time by Project</CardTitle>
        <CardDescription>
          Distribution of coding time across projects
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => (
                    <div className="flex flex-col">
                      <span className="font-medium">{name}</span>
                      <span>{(value as number).toFixed(2)} hours</span>
                      <span className="text-muted-foreground">
                        {props.payload.percentage}%
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} (${percentage}%)`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Legend />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
