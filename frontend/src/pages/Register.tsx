import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import api from '@/services/api';
import { toast } from 'sonner';

interface Course { _id: string; name: string; }

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [rollNo, setRollNo] = useState('');
    const [courseId, setCourseId] = useState('');
    const [password, setPassword] = useState('');
    const [faceImage, setFaceImage] = useState<File | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        api.get('/courses').then(res => {
            setCourses(res.data);
            if (res.data.length > 0) setCourseId(res.data[0]._id);
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!faceImage) { toast.warning('Please select a face image.'); return; }
        
        setIsLoading(true);
        const formData = new FormData();
        formData.append('name', name);
        formData.append('roll_no', rollNo);
        formData.append('course_id', courseId);
        formData.append('password', password);
        formData.append('face_image', faceImage);

        try {
            const response = await api.post('/admin/register-student', formData);
            toast.success('Student Registered', { description: response.data.msg });
            // Clear form
            setName(''); setRollNo(''); setPassword(''); setFaceImage(null);
            // You might need to reset the file input visually as well
            const fileInput = document.getElementById('face_image') as HTMLInputElement;
            if (fileInput) fileInput.value = "";
        } catch (error: any) {
            toast.error('Registration Failed', { description: error.response?.data?.msg || 'An error occurred.' });
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <Layout>
            <h1 className="text-3xl font-bold mb-6">Register New Student</h1>
             <Card className="w-full max-w-2xl">
                <CardHeader>
                    <CardTitle>Student Details</CardTitle>
                    <CardDescription>Fill in the form to onboard a new student.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Full Name</Label>
                                <Input id="name" required value={name} onChange={e => setName(e.target.value)} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="roll_no">Roll Number</Label>
                                <Input id="roll_no" required value={rollNo} onChange={e => setRollNo(e.target.value)} />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="course">Course</Label>
                             <Select value={courseId} onValueChange={setCourseId} required>
                                <SelectTrigger><SelectValue placeholder="Select a course..." /></SelectTrigger>
                                <SelectContent>
                                    {courses.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="face_image">Face Image</Label>
                            <Input id="face_image" type="file" accept="image/*" required onChange={(e) => setFaceImage(e.target.files ? e.target.files[0] : null)} />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? 'Registering...' : 'Register Student'}
                        </Button>
                    </form>
                </CardContent>
             </Card>
        </Layout>
    );
}