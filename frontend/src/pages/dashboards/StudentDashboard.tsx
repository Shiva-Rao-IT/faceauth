import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import StatsCard from '@/components/StatsCard';
import api from '@/services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'sonner';

// Data structure interfaces
interface WeeklyRecord { week: string; percentage: number; }
interface MonthlyRecord { name: string; value: number; }

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

// Colors for the Pie Chart
const COLORS = ['#16a34a', '#ef4444']; // Green for Present, Red for Absent

export default function StudentDashboard() {
    const [weeklyData, setWeeklyData] = useState<WeeklyRecord[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyRecord[]>([]);
    const [overallPercentage, setOverallPercentage] = useState(0);
    const [absencesThisMonth, setAbsencesThisMonth] = useState(0);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentMonth = new Date().toISOString().slice(0, 7);
                const [weeklyRes, monthlyRes] = await Promise.all([
                    api.get('/student/attendance?view=weekly'),
                    api.get(`/student/attendance?view=monthly&month=${currentMonth}`)
                ]);

                // Process Weekly Data
                const weeklyRecords = weeklyRes.data.viewData || [];
                setWeeklyData(weeklyRecords);
                if (weeklyRecords.length > 0) {
                    const total = weeklyRecords.reduce((acc: number, curr: WeeklyRecord) => acc + curr.percentage, 0);
                    setOverallPercentage(total / weeklyRecords.length);
                }
                
                // Process Monthly Data
                const monthlyRecords = monthlyRes.data.viewData || [];
                setMonthlyData(monthlyRecords);
                const absentData = monthlyRecords.find((d: MonthlyRecord) => d.name === 'Absent');
                setAbsencesThisMonth(absentData ? absentData.value : 0);

            } catch (error) {
                toast.error("Failed to load dashboard analytics.");
            }
        };

        fetchData();
    }, []);

    return (
        <div className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
                <StatsCard title="Overall Attendance" value={`${overallPercentage.toFixed(2)}%`} description="Your average attendance across all weeks." />
                <StatsCard title="Absences This Month" value={absencesThisMonth} description="Total classes missed in the current month." />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle>Weekly Attendance Trend</CardTitle></CardHeader>
                    <CardContent>
                        <div style={{ width: '100%', height: 300 }}>
                             <ResponsiveContainer>
                                <LineChart data={weeklyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="week" fontSize={12} />
                                    <YAxis domain={[0, 100]} fontSize={12} tickFormatter={(value) => `${value}%`} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Line type="monotone" dataKey="percentage" stroke="#3b82f6" strokeWidth={2} name="Attendance %" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader><CardTitle>Current Month Summary</CardTitle></CardHeader>
                    <CardContent>
                        <div style={{ width: '100%', height: 300 }}>
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={monthlyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label>
                                        {monthlyData.map((entry, index) => (
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