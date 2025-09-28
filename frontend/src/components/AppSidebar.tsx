import { NavLink } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Home, UserPlus, BarChart2, Camera, FileText, Users, User, Search, Download } from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from './ui/checkbox';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import api from '@/services/api';

interface Course {
    _id: string;
    name: string;
}

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<Record<string, boolean>>({});

  useEffect(() => {
      if (user?.role === 'admin') {
          api.get('/courses').then(res => {
              setCourses(res.data);
              const initialSelection = res.data.reduce((acc: Record<string, boolean>, course: Course) => {
                  acc[course._id] = true;
                  return acc;
              }, {});
              setSelectedCourses(initialSelection);
          }).catch(() => toast.error("Failed to load courses for report."));
      }
  }, [user?.role]);

  const commonLinks = [
    { to: '/', icon: <Home className="h-4 w-4" />, label: 'Dashboard' },
    { to: '/profile', icon: <User className="h-4 w-4" />, label: 'Profile' },
  ];
  const roleLinks = {
    admin: [
      { to: '/register', icon: <UserPlus className="h-4 w-4" />, label: 'Register Student' },
      { to: '/analytics', icon: <BarChart2 className="h-4 w-4" />, label: 'Analytics' },
      { to: '/users', icon: <Users className="h-4 w-4" />, label: 'Manage Users' },
      { to: '/student-lookup', icon: <Search className="h-4 w-4" />, label: 'Student Lookup' },
    ],
    teacher: [{ to: '/attendance', icon: <Camera className="h-4 w-4" />, label: 'Mark Attendance' }],
    student: [{ to: '/reports', icon: <FileText className="h-4 w-4" />, label: 'Attendance Reports' }],
  };
  const links = [...commonLinks, ...(roleLinks[user?.role as keyof typeof roleLinks] || [])];

  const handleCourseSelectionChange = (courseId: string, checked: boolean) => {
    setSelectedCourses(prev => ({ ...prev, [courseId]: checked }));
  };

  const handleFullReportDownload = async () => {
    const selectedIds = Object.keys(selectedCourses).filter(id => selectedCourses[id]);
    if (selectedIds.length === 0) {
        toast.warning("Please select at least one course.");
        return;
    }
    setIsDownloading(true);
    try {
        const queryParams = new URLSearchParams({ month, courses: selectedIds.join(',') });
        const response = await api.get(`/admin/full-report?${queryParams}`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `full_school_report_${month}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        toast.success("Full school report downloaded successfully!");
    } catch (error) {
        toast.error("Failed to generate full report.");
    } finally {
        setIsDownloading(false);
    }
  };

  return (
    <aside className="w-64 flex flex-col bg-card text-card-foreground border-r">
      <div className="p-4 border-b">
        <h1 className="text-2xl font-bold text-primary text-center">FaceAuth</h1>
      </div>
      <nav className="flex-1 p-2 space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center p-2 text-sm font-medium rounded-md transition-colors ${
                isActive ? 'bg-accent text-accent-foreground' : 'hover:bg-accent/50'
              }`
            }
          >
            {/* THIS IS THE PART THAT WAS MISSING */}
            <span className="mr-3">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      
      {user?.role === 'admin' && (
        <Dialog>
            <DialogTrigger asChild>
                <div className="p-2 border-t">
                    <Button variant="outline" className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Generate Report
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader><DialogTitle>Generate Full School Report</DialogTitle></DialogHeader>
                <div className="space-y-4 py-4">
                    <div>
                        <Label htmlFor="report-month">Report Month</Label>
                        <Input id="report-month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
                    </div>
                    <div>
                        <Label>Select Courses</Label>
                        <ScrollArea className="h-32 w-full rounded-md border p-2 mt-2">
                             <div className="space-y-2">
                                {courses.map((course) => (
                                    <div key={course._id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`course-${course._id}`}
                                            checked={selectedCourses[course._id] || false}
                                            onCheckedChange={(checked) => handleCourseSelectionChange(course._id, !!checked)}
                                        />
                                        <Label htmlFor={`course-${course._id}`} className="font-normal">{course.name}</Label>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                    <Button onClick={handleFullReportDownload} disabled={isDownloading}>
                        {isDownloading ? 'Generating...' : 'Download'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

      <div className="p-2 border-t">
        <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            Logout
        </Button>
      </div>
    </aside>
  );
};

export default AppSidebar;