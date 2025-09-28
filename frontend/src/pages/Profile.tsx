import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Shield, BookOpen, Hash } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import api from '@/services/api';
import { toast } from 'sonner';

interface UserProfile {
    name: string;
    role: string;
    email?: string;
    roll_no?: string;
    course_name?: string;
}

const InfoField = ({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string }) => {
    if (!value) return null;
    return (
        <div className="flex flex-col space-y-1">
            <Label className="text-sm text-muted-foreground">{label}</Label>
            <div className="flex items-center text-sm">
                <span className="mr-2 text-muted-foreground">{icon}</span>
                <span>{value}</span>
            </div>
        </div>
    );
};

export default function Profile() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const initials = user?.name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

    useEffect(() => {
        api.get('/profile/me')
            .then(res => setProfile(res.data))
            .catch(() => toast.error("Failed to fetch profile information."));
    }, []);

    if (!profile) {
        return <Layout><p>Loading profile...</p></Layout>;
    }

    return (
        <Layout>
            <div className="mb-6">
                <h1 className="text-3xl font-bold">Profile</h1>
                <p className="text-muted-foreground">Manage your account settings and personal information</p>
            </div>
            <div className="grid lg:grid-cols-3 gap-6">
                {/* Profile Picture Card */}
                <Card className="lg:col-span-1 flex flex-col items-center text-center p-6">
                    <h2 className="text-lg font-semibold self-start">Profile Picture</h2>
                    <p className="text-sm text-muted-foreground self-start mb-6">Your profile avatar</p>
                    <Avatar className="h-32 w-32 mb-4">
                        <AvatarFallback className="text-5xl">{initials}</AvatarFallback>
                    </Avatar>
                    <p className="text-xl font-semibold">{profile.name}</p>
                    <p className="text-sm text-muted-foreground mb-4">{profile.email || profile.roll_no}</p>
                    <Badge className="capitalize">{profile.role}</Badge>
                </Card>

                {/* Personal Information Card */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <div>
                            <CardTitle>Personal Information</CardTitle>
                            <CardDescription>Your personal details</CardDescription>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid sm:grid-cols-2 gap-6">
                            <InfoField icon={<User size={16} />} label="Full Name" value={profile.name} />
                            <InfoField icon={<Mail size={16} />} label="Email Address" value={profile.email} />
                            <InfoField icon={<Shield size={16} />} label="Role" value={profile.role} />
                            <InfoField icon={<Hash size={16} />} label="Roll Number" value={profile.roll_no} />
                            <InfoField icon={<BookOpen size={16} />} label="Course" value={profile.course_name} />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </Layout>
    );
}