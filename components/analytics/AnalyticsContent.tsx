"use client";

import { useState } from "react";
import { useDashboardStats } from "@/lib/hooks";
import { TimeLineChart } from "./TimeLineChart";
import { ProjectPieChart } from "./ProjectPieChart";
import { LanguageBarChart } from "./LanguageBarChart";
import { ActivityHeatmap } from "./ActivityHeatmap";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TimeRange = "day" | "week" | "month";

export function AnalyticsContent() {
  const [timeRange, setTimeRange] = useState<TimeRange>("week");
  const { data: stats, isLoading, error, refetch } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load analytics</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      {/* Header with Time Range Filter */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Detailed insights into your coding activity
          </p>
        </div>
        <Select
          value={timeRange}
          onValueChange={(v) => setTimeRange(v as TimeRange)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Daily</SelectItem>
            <SelectItem value="week">Weekly</SelectItem>
            <SelectItem value="month">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6">
        {/* Time Over Days/Weeks/Months - Line Chart */}
        <div className="col-span-full">
          <TimeLineChart
            data={stats.dailyActivity || []}
            timeRange={timeRange}
          />
        </div>

        {/* Project Pie Chart and Language Bar Chart */}
        <div className="grid gap-6 md:grid-cols-2">
          <ProjectPieChart projects={stats.projects || []} />
          <LanguageBarChart languages={stats.languages || []} />
        </div>

        {/* Activity Heatmap */}
        <div className="col-span-full">
          <ActivityHeatmap data={stats.dailyActivity || []} />
        </div>
      </div>
    </div>
  );
}
