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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface LanguageBarChartProps {
  languages: Array<{
    language: string;
    duration: number;
    percentage: number;
  }>;
}

const chartConfig = {
  duration: {
    label: "Coding Time",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function LanguageBarChart({ languages }: LanguageBarChartProps) {
  const chartData = languages.slice(0, 8).map((lang) => ({
    language: lang.language,
    duration: lang.duration / 3600, // Convert to hours
    percentage: lang.percentage.toFixed(1),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Time by Language</CardTitle>
        <CardDescription>
          Breakdown of coding time by programming language
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            data={chartData}
            margin={{ left: 12, right: 12, top: 12, bottom: 12 }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="language"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value.toFixed(1)}h`}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value, name, props) => (
                    <div className="flex flex-col">
                      <span className="font-medium">
                        {props.payload.language}
                      </span>
                      <span>{(value as number).toFixed(2)} hours</span>
                      <span className="text-muted-foreground">
                        {props.payload.percentage}%
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Bar
              dataKey="duration"
              fill="var(--color-duration)"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
