import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import api from '@/services/api';
import { toast } from 'sonner';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Data structure interfaces
interface Student { _id: string; name: string; roll_no: string; }
interface DailyRecord { date: string; status: string; }
interface WeeklyRecord { week: string; percentage: number; }
interface MonthlyRecord { name: string; value: number; }

// A sub-component to neatly handle rendering the different views
const AttendanceDisplay = ({ view, records, isLoading }: { view: string, records: any[], isLoading: boolean }) => {
    const COLORS = ['#16a34a', '#dc2626']; // green, red for Pie Chart

    if (isLoading) {
        return <p className="text-center p-4">Loading records...</p>;
    }

    if (records.length === 0) {
        return <p className="text-center p-4 text-gray-500">No records to display.</p>;
    }

    switch (view) {
        case 'daily':
            return (
                <Table>
                    <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead></TableRow></TableHeader>
                    <TableBody>
                        {(records as DailyRecord[]).map(r => (
                            <TableRow key={r.date}>
                                <TableCell>{r.date}</TableCell>
                                <TableCell><Badge variant={r.status === 'Present' ? 'default' : 'destructive'}>{r.status}</Badge></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            );
        case 'weekly':
            return (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <LineChart data={records as WeeklyRecord[]}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="week" /><YAxis /><Tooltip /><Line type="monotone" dataKey="percentage" stroke="#3b82f6" name="Attendance %" /></LineChart>
                    </ResponsiveContainer>
                </div>
            );
        case 'monthly':
            return (
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                        <PieChart>
                            <Pie data={records as MonthlyRecord[]} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                {records.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                            </Pie>
                            <Tooltip /><Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            );
        default:
            return null;
    }
};


export default function StudentLookup() {
    const [students, setStudents] = useState<Student[]>([]);
    const [selectedStudent, setSelectedStudent] = useState('');
    const [view, setView] = useState('daily');
    const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
    const [records, setRecords] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        api.get('/students').then(res => setStudents(res.data))
           .catch(() => toast.error("Failed to load student list."));
    }, []);

    useEffect(() => {
        if (selectedStudent) {
            setIsLoading(true);
            setRecords([]);

            let url = `/admin/student-analytics/${selectedStudent}?view=${view}`;
            if (view === 'monthly') {
                url += `&month=${month}`;
            }

            api.get(url)
                .then(res => setRecords(res.data))
                .catch(() => toast.error(`Failed to fetch ${view} records.`))
                .finally(() => setIsLoading(false));
        }
    }, [selectedStudent, view, month]);

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6">Student Attendance Lookup</h1>
            <Card className="w-full max-w-4xl">
                <CardHeader>
                    <CardTitle>Select a Student</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-2 mb-6">
                        <Label htmlFor="student-select">Student</Label>
                        <Select onValueChange={setSelectedStudent}>
                            <SelectTrigger id="student-select">
                                <SelectValue placeholder="Select a student to view their records..." />
                            </SelectTrigger>
                            <SelectContent>
                                {students.map(s => (
                                    <SelectItem key={s._id} value={s._id}>{s.name} ({s.roll_no})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedStudent && (
                        <Tabs value={view} onValueChange={setView}>
                            <TabsList className="grid w-full grid-cols-3">
                                <TabsTrigger value="daily">Daily</TabsTrigger>
                                <TabsTrigger value="weekly">Weekly</TabsTrigger>
                                <TabsTrigger value="monthly">Monthly</TabsTrigger>
                            </TabsList>
                            <TabsContent value="daily">
                                <AttendanceDisplay view="daily" records={records} isLoading={isLoading} />
                            </TabsContent>
                            <TabsContent value="weekly">
                                <AttendanceDisplay view="weekly" records={records} isLoading={isLoading} />
                            </TabsContent>
                            <TabsContent value="monthly">
                                <div className="grid gap-2 mb-4" style={{maxWidth: '200px'}}>
                                    <Label htmlFor="month-select">Select Month</Label>
                                    <Input id="month-select" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                                </div>
                                <AttendanceDisplay view="monthly" records={records} isLoading={isLoading} />
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>
        </Layout>
    );
}