import Layout from '@/components/Layout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import TeacherDashboard from './dashboards/TeacherDashboard';
import StudentDashboard from './dashboards/StudentDashboard'; // Import the new dashboard

export default function Dashboard() {
    const { user } = useAuth();

    const renderDashboard = () => {
        switch (user?.role) {
            case 'admin':
                return <AdminDashboard />;
            case 'teacher':
                return <TeacherDashboard />;
            case 'student':
                return <StudentDashboard />; // Use the new component here
            default:
                return (
                    <Card>
                        <CardHeader><CardTitle>Welcome</CardTitle></CardHeader>
                        <CardContent><p>Loading your dashboard...</p></CardContent>
                    </Card>
                );
        }
    };

    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            {renderDashboard()}
        </Layout>
    );
}