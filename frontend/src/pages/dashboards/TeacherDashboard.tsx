import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import StatsCard from '@/components/StatsCard';
import api from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { toast } from 'sonner';
import { Download } from 'lucide-react';

// Interface for a Course object
interface Course {
    _id: string;
    name: string;
}

// Interface for the analytics data fetched from the API
interface TeacherAnalyticsData {
    studentsInCourse: number;
    overallAttendancePercentage: number;
    dailyStats: { date: string; Present: number; Absent: number }[];
    totalClasses: number;
}

// Custom Tooltip component for a cleaner look on chart hover
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 bg-background border rounded-md shadow-lg">
          <p className="font-bold">{label}</p>
          <p className="text-sm text-green-600">{`Present: ${payload[0].value}`}</p>
          <p className="text-sm text-red-600">{`Absent: ${payload[1].value}`}</p>
        </div>
      );
    }
    return null;
};


export default function TeacherDashboard() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // Default to YYYY-MM format
    const [analytics, setAnalytics] = useState<TeacherAnalyticsData | null>(null);
    const [isDownloading, setIsDownloading] = useState(false);

    // Fetch the list of available courses when the component first loads
    useEffect(() => {
        api.get('/courses').then(response => {
            setCourses(response.data);
            if (response.data.length > 0) {
                setSelectedCourse(response.data[0]._id);
            }
        }).catch(() => toast.error("Failed to load courses."));
    }, []);

    // Fetch analytics data whenever the selected course or month changes
    useEffect(() => {
        if (selectedCourse) {
            const queryParams = new URLSearchParams({ month });
            api.get(`/teacher/analytics/${selectedCourse}?${queryParams}`)
                .then(response => setAnalytics(response.data))
                .catch(() => toast.error("Failed to load analytics for the selected course."));
        }
    }, [selectedCourse, month]);

    // Function to handle the Excel report download
    const handleReportDownload = async () => {
        if (!selectedCourse || !month) {
            toast.error("Please select a course and a month.");
            return;
        }
        setIsDownloading(true);
        try {
            const response = await api.get(`/teacher/report/${selectedCourse}?month=${month}`, {
                responseType: 'blob', // Important for handling file downloads
            });
            // Create a temporary link to trigger the browser download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            const courseName = courses.find(c => c._id === selectedCourse)?.name || 'report';
            link.setAttribute('download', `attendance_${courseName}_${month}.xlsx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            toast.success("Report downloaded successfully!");
        } catch (error) {
            toast.error("Failed to generate report.");
        } finally {
            setIsDownloading(false);
        }
    };

    const selectedCourseName = courses.find(c => c._id === selectedCourse)?.name || "Course";

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Course Analytics & Reports</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <Label htmlFor="course-select">Select Course</Label>
                        <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                            <SelectTrigger id="course-select"><SelectValue placeholder="Select a course..." /></SelectTrigger>
                            <SelectContent>{courses.map((course) => (<SelectItem key={course._id} value={course._id}>{course.name}</SelectItem>))}</SelectContent>
                        </Select>
                    </div>
                    <div className="md:col-span-1">
                        <Label htmlFor="month-select">Select Month</Label>
                        <Input id="month-select" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                         <Button onClick={handleReportDownload} className="w-full" disabled={isDownloading}>
                            <Download className="mr-2 h-4 w-4" />
                            {isDownloading ? 'Generating...' : 'Generate Report'}
                         </Button>
                    </div>
                </CardContent>
            </Card>

            {analytics && (
                <>
                    <div className="grid gap-6 md:grid-cols-3">
                        <StatsCard title="Total Students" value={analytics.studentsInCourse} description={`Enrolled in ${selectedCourseName}`} />
                        <StatsCard title="Monthly Attendance" value={`${analytics.overallAttendancePercentage.toFixed(2)}%`} description={`Average for ${month}`} />
                        <StatsCard title="Total Classes" value={analytics.totalClasses} description={`Held in ${month}`} />
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Attendance (Last 7 Days)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div style={{ width: '100%', height: 300 }}>
                                <ResponsiveContainer>
                                    <BarChart data={analytics.dailyStats} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="date" fontSize={12} />
                                        <YAxis fontSize={12} />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend />
                                        <Bar dataKey="Present" stackId="a" fill="#16a34a" radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="Absent" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
}