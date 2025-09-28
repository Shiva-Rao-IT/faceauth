import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import api from '@/services/api';
import { toast } from "sonner";

interface Course { _id: string; name: string; }

export default function Attendance() {
  const webcamRef = useRef<Webcam>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    api.get('/courses').then(res => {
        setCourses(res.data);
        if (res.data.length > 0) setCourseId(res.data[0]._id);
    });
  }, []);

  const captureAndMark = useCallback(async () => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (!imageSrc) { toast.error('Could not capture image.'); return; }
    if (!courseId) { toast.warning('Please select a course.'); return; }

    setIsLoading(true);
    const blob = await fetch(imageSrc).then(res => res.blob());
    const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append('course_id', courseId);
    formData.append('live_image', file);
    try {
        const response = await api.post('/teacher/mark-attendance', formData);
        toast.success(response.data.msg);
    } catch (error: any) {
        toast.error('Failed to Mark Attendance', { description: error.response?.data?.msg || 'No student match found.' });
    } finally {
        setIsLoading(false);
    }
  }, [webcamRef, courseId]);

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Mark Attendance</h1>
      <Card>
        <CardHeader>
          <CardTitle>Live Camera Feed</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="w-full max-w-lg border rounded-md overflow-hidden">
            <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" width="100%" />
          </div>
          <div className="w-full max-w-lg flex gap-4">
            <Select value={courseId} onValueChange={setCourseId}>
                <SelectTrigger><SelectValue placeholder="Select a course..." /></SelectTrigger>
                <SelectContent>
                    {courses.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                </SelectContent>
            </Select>
            <Button onClick={captureAndMark} disabled={isLoading} className="flex-shrink-0">
                {isLoading ? 'Processing...' : 'Capture & Mark'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </Layout>
  );
}