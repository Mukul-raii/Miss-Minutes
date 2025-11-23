"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ActivityHeatmapProps {
  data: Array<{ date: string; duration: number }>;
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  // Create a heatmap for the last 12 weeks
  const weeks = 12;
  const daysPerWeek = 7;
  const now = new Date();
  const startDate = new Date();
  startDate.setDate(now.getDate() - weeks * daysPerWeek);

  // Create a map of date to duration
  const durationMap = new Map<string, number>();
  data.forEach((item) => {
    const dateStr = item.date.split("T")[0]; // Handle ISO string or date string
    durationMap.set(dateStr, item.duration);
  });

  // Find max duration for color scaling
  const maxDuration = Math.max(...Array.from(durationMap.values()), 1);

  // Generate grid data
  const gridData: Array<Array<{ date: Date; duration: number }>> = [];

  for (let week = 0; week < weeks; week++) {
    const weekData: Array<{ date: Date; duration: number }> = [];
    for (let day = 0; day < daysPerWeek; day++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + week * daysPerWeek + day);
      const dateStr = date.toISOString().split("T")[0];
      const duration = durationMap.get(dateStr) || 0;
      weekData.push({ date, duration });
    }
    gridData.push(weekData);
  }

  const getIntensityColor = (duration: number) => {
    if (duration === 0) return "bg-muted";
    const intensity = Math.min(duration / maxDuration, 1);
    if (intensity < 0.25) return "bg-green-200 dark:bg-green-900";
    if (intensity < 0.5) return "bg-green-400 dark:bg-green-700";
    if (intensity < 0.75) return "bg-green-600 dark:bg-green-500";
    return "bg-green-800 dark:bg-green-300";
  };

  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Heatmap</CardTitle>
        <CardDescription>
          Your coding activity over the last {weeks} weeks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-flex gap-1">
            {/* Day labels */}
            <div className="flex flex-col gap-1 text-xs text-muted-foreground mr-2">
              {dayLabels.map((label, i) => (
                <div key={i} className="h-3 flex items-center">
                  {label}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            {gridData.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`h-3 w-3 rounded-sm ${getIntensityColor(
                      day.duration
                    )}`}
                    title={`${day.date.toLocaleDateString()}: ${(
                      day.duration / 3600
                    ).toFixed(2)} hours`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-sm bg-muted" />
            <div className="h-3 w-3 rounded-sm bg-green-200 dark:bg-green-900" />
            <div className="h-3 w-3 rounded-sm bg-green-400 dark:bg-green-700" />
            <div className="h-3 w-3 rounded-sm bg-green-600 dark:bg-green-500" />
            <div className="h-3 w-3 rounded-sm bg-green-800 dark:bg-green-300" />
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}
