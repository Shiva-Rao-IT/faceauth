import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from '@/services/api';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DailyRecord { date: string; status: string; }
interface WeeklyRecord { week: string; percentage: number; }
interface MonthlyRecord { name: string; value: number; }

export default function AttendanceReports() {
    const [dailyData, setDailyData] = useState<DailyRecord[]>([]);
    const [weeklyData, setWeeklyData] = useState<WeeklyRecord[]>([]);
    const [monthlyData, setMonthlyData] = useState<MonthlyRecord[]>([]);
    const [studentName, setStudentName] = useState('');
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format

    useEffect(() => {
        // Fetch all three views
        api.get('/student/attendance?view=daily').then(res => {
            setDailyData(res.data.viewData);
            setStudentName(res.data.studentName);
        });
        api.get('/student/attendance?view=weekly').then(res => setWeeklyData(res.data.viewData));
        api.get(`/student/attendance?view=monthly&month=${month}`).then(res => setMonthlyData(res.data.viewData));
    }, [month]);

    const COLORS = ['#16a34a', '#dc2626']; // green, red

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-2">My Attendance Report</h1>
            <p className="text-muted-foreground mb-6">Viewing records for {studentName}</p>
            <Tabs defaultValue="daily">
                <TabsList>
                    <TabsTrigger value="daily">Daily Log</TabsTrigger>
                    <TabsTrigger value="weekly">Weekly View</TabsTrigger>
                    <TabsTrigger value="monthly">Monthly View</TabsTrigger>
                </TabsList>
                <TabsContent value="daily">
                    <Card><CardHeader><CardTitle>Daily Attendance</CardTitle></CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                                <TableBody>
                                    {dailyData.map(r => <TableRow key={r.date}><TableCell>{r.date}</TableCell><TableCell><Badge variant={r.status === 'Present' ? 'default' : 'destructive'}>{r.status}</Badge></TableCell></TableRow>)}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="weekly">
                    <Card><CardHeader><CardTitle>Weekly Attendance Percentage</CardTitle></CardHeader>
                        <CardContent><div style={{ width: '100%', height: 400 }}>
                            <ResponsiveContainer>
                                <LineChart data={weeklyData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="week" /><YAxis /><Tooltip /><Legend /><Line type="monotone" dataKey="percentage" stroke="#3b82f6" name="Attendance %" /></LineChart>
                            </ResponsiveContainer>
                        </div></CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="monthly">
                     <Card><CardHeader><CardTitle>Monthly Summary ({month})</CardTitle></CardHeader>
                        <CardContent><div style={{ width: '100%', height: 400 }}>
                             <ResponsiveContainer>
                                <PieChart>
                                    <Pie data={monthlyData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={150} label>
                                        {monthlyData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div></CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </Layout>
    );
}