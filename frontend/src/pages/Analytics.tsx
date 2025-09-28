import Layout from '@/components/Layout';
import StatsCard from '@/components/StatsCard';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import api from '@/services/api';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { toast } from 'sonner';

interface Course {
    _id: string;
    name: string;
}

interface AnalyticsData {
    totalStudents: number;
    overallAttendancePercentage: number;
    courseAnalytics: { name: string; attendance: number }[];
}

// A modern, vibrant color palette for the chart
const COLORS = ['#3b82f6', '#8b5cf6', '#14b8a6', '#f59e0b', '#ef4444'];

// Custom Tooltip Component for a cleaner look
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-white border rounded-md shadow-lg">
        <p className="font-bold">{`${label}`}</p>
        <p className="text-sm">{`Attendance: ${payload[0].value.toFixed(2)}%`}</p>
      </div>
    );
  }
  return null;
};


export default function Analytics() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourses, setSelectedCourses] = useState<Record<string, boolean>>({});

    // Fetch the list of all courses on component mount
    useEffect(() => {
        api.get('/courses').then(response => {
            setCourses(response.data);
            const initialSelection = response.data.reduce((acc: Record<string, boolean>, course: Course) => {
                acc[course._id] = true;
                return acc;
            }, {});
            setSelectedCourses(initialSelection);
        }).catch(() => {
            toast.error("Failed to load course list.");
        });
    }, []);

    // Re-fetch analytics data whenever the course selection changes
    useEffect(() => {
        if (courses.length === 0) return;

        const selectedIds = Object.keys(selectedCourses).filter(id => selectedCourses[id]);
        
        if (selectedIds.length === 0) {
            setData({ totalStudents: 0, overallAttendancePercentage: 0, courseAnalytics: [] });
            return;
        }

        const queryParams = new URLSearchParams({ courses: selectedIds.join(',') });
        api.get(`/admin/analytics?${queryParams}`).then(response => {
            setData(response.data);
        }).catch(() => {
            toast.error("Failed to load analytics data.");
        });

    }, [selectedCourses, courses]);

    const handleCourseSelectionChange = (courseId: string, checked: boolean) => {
        setSelectedCourses(prev => ({
            ...prev,
            [courseId]: checked,
        }));
    };

    if (!data) return <Layout><p>Loading analytics...</p></Layout>;

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6">Overall Analytics</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader><CardTitle>Filters</CardTitle></CardHeader>
                    <CardContent>
                        <Label className="font-semibold">Filter by Course</Label>
                        <ScrollArea className="h-48 w-full rounded-md border p-4 mt-2">
                            <div className="space-y-2">
                                {courses.map((course) => (
                                    <div key={course._id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={course._id}
                                            checked={selectedCourses[course._id] || false}
                                            onCheckedChange={(checked) => handleCourseSelectionChange(course._id, !!checked)}
                                        />
                                        <Label htmlFor={course._id} className="font-normal">{course.name}</Label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>

                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <StatsCard title="Total Students" value={data.totalStudents} description="Students in selected courses." />
                    <StatsCard title="Overall Attendance" value={`${data.overallAttendancePercentage.toFixed(2)}%`} description="Average for selected courses." />
                </div>
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle>Attendance by Class</CardTitle>
                </CardHeader>
                <CardContent>
                     <div style={{ width: '100%', height: 400 }}>
                        <ResponsiveContainer>
                            <BarChart data={data.courseAnalytics} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`}/>
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(230, 230, 230, 0.4)'}}/>
                                <Bar dataKey="attendance" name="Attendance %" radius={[4, 4, 0, 0]}>
                                    {data.courseAnalytics.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>
        </Layout>
    );
}