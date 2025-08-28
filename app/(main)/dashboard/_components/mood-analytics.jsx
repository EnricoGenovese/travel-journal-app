"use client"

import { getMoodAnalytics } from "@/actions/analytics";
import { Select, SelectContent, SelectItem } from "@/components/ui/select";
import useFetch from "@/hooks/useFetch";
import { useUser } from "@clerk/nextjs";
import { SelectTrigger, SelectValue } from "@radix-ui/react-select";
import React, { useEffect, useState } from "react";
import MoodAnalyticsSkeleton from "./analytics-loading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMoodById, getMoodTrend } from "@/app/lib/moods";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format, parseISO } from "date-fns";


const timeOptions = [
  { value: "7d", label: "Last 7 days" },
  { value: "15d", label: "Last 15 days" },
  { value: "30d", label: "Last 30 days" },
];

const MoodAnalytics = () => {

  const [period, setPeriod] = useState("7d");

  useEffect(() => {
    fetchAnalytics(period)
  }, [period]);

  const {
    loading,
    data: analytics,
    func: fetchAnalytics,
  } = useFetch(getMoodAnalytics);

  const { isLoaded } = useUser();


  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-white p-4 border rounded-lg shadow-lg">
          <p className="font-medium">
            {format(parseISO(label), "d MMM yyyy")}
          </p>
          <p className="text-orange-600">Average Mood: {payload[0].value}</p>
          <p className="text-blue-600">Entries: {payload[1].value}</p>
        </div>
      );
    }
    return null;
  };

  if (loading || !analytics?.data || !isLoaded) {
    return <MoodAnalyticsSkeleton />
  }

  const { timeline, stats } = analytics.data;

  return (
    <>
      <div className="flex justify-between items-center">
        <h2 className="text-5xl font-bold gradient-title">Dashboard</h2>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-[140px]">
            {timeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space--y-6">
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="class-sm font-medium">
                Total Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2-xl font-bold">{stats.totalEntries}</p>
              <p className="text-xs text-muted-foreground">
                ~ {stats.dailyAverage.toFixed(1)} entries per day
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="class-sm font-medium">
                Average Mood
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2-xl font-bold">{stats.averageScore}/10</p>
              <p className="text-xs text-muted-foreground">
                Overall Mood Score
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="class-sm font-medium">
                Mood Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {getMoodById(stats.mostFrequentMood)?.emoji}{""}
                {getMoodTrend(stats.averageScore)}
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Mood Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer>
                <LineChart
                  data={timeline}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) => format(parseISO(date), "dd MMM")}
                  />
                  <YAxis
                    yAxisId="left"
                    domain={[0, 10]} />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 'auto']} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="averageScore"
                    stroke="#f97316"
                    name="Average Mood"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="entryCount"
                    stroke="#3b82f6"
                    name="Number of Entries"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
};


export default MoodAnalytics;