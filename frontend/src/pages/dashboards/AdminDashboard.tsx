import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from '@/components/StatsCard';
import api from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'sonner';

interface AnalyticsData {
    totalStudents: number;
    overallAttendancePercentage: number;
    courseAnalytics: { name: string; attendance: number }[];
}

// Custom Tooltip for a cleaner look on hover
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background border rounded-md shadow-lg">
          <p className="font-bold">{`${label}`}</p>
          <p className="text-sm">{`Attendance: ${payload[0].value.toFixed(2)}%`}</p>
        </div>
      );
    }
    return null;
};

// Colors for the charts
const COLORS = ['#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444'];

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

    useEffect(() => {
        api.get('/admin/analytics')
            .then(response => setAnalytics(response.data))
            .catch(() => toast.error("Failed to load dashboard analytics."));
    }, []);

    if (!analytics) {
        return <p>Loading dashboard analytics...</p>;
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <StatsCard title="Total Students" value={analytics.totalStudents} description="Students across all courses" />
                <StatsCard title="Overall Attendance" value={`${analytics.overallAttendancePercentage.toFixed(2)}%`} description="Average for all classes" />
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Attendance by Course</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <BarChart data={analytics.courseAnalytics} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                                    <YAxis domain={[0, 100]} tickLine={false} axisLine={false} fontSize={12} tickFormatter={(value) => `${value}%`} />
                                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--accent))' }} />
                                    <Bar dataKey="attendance" name="Attendance %" radius={[4, 4, 0, 0]}>
                                        {analytics.courseAnalytics.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Student Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={analytics.courseAnalytics} dataKey="attendance" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false}>
                                        {analytics.courseAnalytics.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}