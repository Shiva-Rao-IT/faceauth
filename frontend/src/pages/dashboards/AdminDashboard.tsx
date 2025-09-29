import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from '@/components/StatsCard';
import api from '@/services/api';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Sector
} from 'recharts';
import { toast } from 'sonner';

interface CourseAnalytic {
    name: string;
    attendance: number;
    studentCount?: number; 
}

interface AnalyticsData {
    totalStudents: number;
    overallAttendancePercentage: number;
    courseAnalytics: CourseAnalytic[];
}

// Custom Tooltip for Bar Chart
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

// Custom Active Shape for Pie Chart (on hover)
const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
        cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle,
        fill, payload, percent, value
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const textRadiusOffset = outerRadius + 40;
    const x2 = cx + textRadiusOffset * cos;
    const y2 = cy + textRadiusOffset * sin;
    const labelX = x2 + (cos >= 0 ? 1 : -1) * 10;
    const labelY = y2;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <Sector
                cx={cx}
                cy={cy}
                innerRadius={innerRadius}
                outerRadius={outerRadius + 5}
                startAngle={startAngle}
                endAngle={endAngle}
                fill={fill}
                stroke={fill}
                strokeWidth={2}
            />
            <Sector
                cx={cx}
                cy={cy}
                startAngle={startAngle}
                endAngle={endAngle}
                innerRadius={outerRadius + 6}
                outerRadius={outerRadius + 8}
                fill={fill}
            />
            <path d={`M${cx + outerRadius * cos},${cy + outerRadius * sin}L${cx + (outerRadius + 20) * cos},${cy + (outerRadius + 20) * sin}L${x2},${y2}`} stroke={fill} fill="none" />
            <circle cx={x2} cy={y2} r={3} fill={fill} stroke="none" />
            <text x={labelX} y={labelY} textAnchor={textAnchor} fill="hsl(var(--foreground))" className="font-semibold">{`${payload.name}`}</text>
            <text x={labelX} y={labelY} dy={18} textAnchor={textAnchor} fill="hsl(var(--muted-foreground))">
                {`${value} Students (${(percent * 100).toFixed(2)}%)`}
            </text>
        </g>
    );
};

// Colors for the charts
const COLORS = ['#6366f1', '#a855f7', '#06b6d4', '#f59e0b', '#dc2626', '#10b981']; 

export default function AdminDashboard() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [activeIndex, setActiveIndex] = useState<number>(-1);

    useEffect(() => {
        api.get('/admin/analytics')
            .then(response => {
                const data: AnalyticsData = response.data;
                const updatedCourseAnalytics = data.courseAnalytics.map(course => ({
                    ...course,
                    studentCount: Math.max(1, Math.round(data.totalStudents * (course.attendance / 100))) 
                }));
                setAnalytics({ ...data, courseAnalytics: updatedCourseAnalytics });
            })
            .catch(() => toast.error("Failed to load dashboard analytics."));
    }, []);

    const onPieEnter = useCallback((_: any, index: number) => {
        setActiveIndex(index);
    }, []);

    const onPieLeave = useCallback(() => {
        setActiveIndex(-1);
    }, []);

    if (!analytics) {
        return <p>Loading dashboard analytics...</p>;
    }

    const studentDistributionData = analytics.courseAnalytics.map(course => ({
        name: course.name,
        value: course.studentCount || 0
    })).filter(entry => entry.value > 0);

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <StatsCard title="Total Students" value={analytics.totalStudents} description="Students across all courses" />
                <StatsCard title="Overall Attendance" value={`${analytics.overallAttendancePercentage.toFixed(2)}%`} description="Average for all classes" />
            </div>
            
            {/* --- CHANGE IS HERE --- */}
            {/* Changed lg:grid-cols-3 to lg:grid-cols-2 to give both cards equal width on large screens */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2"> 
                {/* --- AND HERE --- */}
                {/* Removed lg:col-span-2 so this card takes up 1 column by default */}
                <Card>
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
                        <CardTitle>Student Distribution by Course</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div style={{ width: '100%', height: 300 }}>
                            {studentDistributionData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                                        <Pie
                                            activeIndex={activeIndex}
                                            activeShape={renderActiveShape}
                                            data={studentDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                            nameKey="name"
                                            onMouseEnter={onPieEnter}
                                            onMouseLeave={onPieLeave}
                                            paddingAngle={3}
                                            cornerRadius={5}
                                        >
                                            {studentDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value, name, props) => [`${value} Students`, props.payload.name]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <p className="text-center text-muted-foreground">No student distribution data available.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}