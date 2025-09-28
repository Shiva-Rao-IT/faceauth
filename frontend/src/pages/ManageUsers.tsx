import { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import api from '@/services/api';
import { toast } from 'sonner';

interface Student {
  _id: string;
  name: string;
  roll_no: string;
  course_id: string;
}

interface Course {
    _id: string;
    name: string;
}

export default function ManageUsers() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // State for Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [editedName, setEditedName] = useState('');
  const [editedRollNo, setEditedRollNo] = useState('');
  const [editedCourseId, setEditedCourseId] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // State for Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  
  // State for Image Update Dialog
  const [isImageUploadOpen, setIsImageUploadOpen] = useState(false);
  const [faceImage, setFaceImage] = useState<File | null>(null);
  const [studentToUpdateImage, setStudentToUpdateImage] = useState<Student | null>(null);


  const fetchStudents = () => {
    setIsLoading(true);
    api.get('/students')
      .then(res => setStudents(res.data))
      .catch(() => toast.error("Failed to load students."))
      .finally(() => setIsLoading(false));
  };

  const fetchCourses = () => {
      api.get('/courses').then(res => setCourses(res.data));
  }

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  // --- Edit Handlers ---
  const handleEditClick = (student: Student) => {
    setCurrentStudent(student);
    setEditedName(student.name);
    setEditedRollNo(student.roll_no);
    setEditedCourseId(student.course_id);
    setNewPassword('');
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    // ... (this function remains the same)
    if (!currentStudent) return;
    const payload: { name: string; roll_no: string; course_id: string; password?: string } = { name: editedName, roll_no: editedRollNo, course_id: editedCourseId };
    if (newPassword) { payload.password = newPassword; }
    try {
      await api.put(`/admin/student/${currentStudent._id}`, payload);
      toast.success("Student updated successfully.");
      setIsEditDialogOpen(false);
      fetchStudents();
    } catch (error) {
      toast.error("Failed to update student.");
    }
  };

  // --- Delete Handlers ---
  const handleDeleteClick = (student: Student) => {
    setStudentToDelete(student);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    // ... (this function remains the same)
     if (!studentToDelete) return;
    try {
      await api.delete(`/admin/student/${studentToDelete._id}`);
      toast.success("Student deleted successfully.");
      setIsDeleteDialogOpen(false);
      fetchStudents();
    } catch (error) {
      toast.error("Failed to delete student.");
    }
  };

  // --- Image Update Handlers ---
  const handleImageClick = (student: Student) => {
    setStudentToUpdateImage(student);
    setFaceImage(null);
    setIsImageUploadOpen(true);
  };

  const handleImageUpload = async () => {
    if (!faceImage || !studentToUpdateImage) {
        toast.warning("Please select an image file.");
        return;
    }
    const formData = new FormData();
    formData.append('face_image', faceImage);
    try {
        await api.post(`/admin/student/${studentToUpdateImage._id}/update-face`, formData);
        toast.success("Face image updated successfully!");
        setIsImageUploadOpen(false);
    } catch (error: any) {
        toast.error("Image Update Failed", { description: error.response?.data?.msg || 'An error occurred.' });
    }
  };

  return (
    <Layout>
      <h1 className="text-3xl font-bold mb-6">Manage Users</h1>
      <Card>
        <CardHeader><CardTitle>Student List</CardTitle></CardHeader>
        <CardContent>
          {isLoading ? <p>Loading students...</p> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map(student => (
                  <TableRow key={student._id}>
                    <TableCell>{student.name}</TableCell>
                    <TableCell>{student.roll_no}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleImageClick(student)}>
                        <ImageIcon className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(student)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteClick(student)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Student Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        {/* ... (This dialog's code remains the same) */}
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={editedName} onChange={(e) => setEditedName(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rollno" className="text-right">Roll No</Label>
              <Input id="rollno" value={editedRollNo} onChange={(e) => setEditedRollNo(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="course" className="text-right">Course</Label>
              <Select value={editedCourseId} onValueChange={setEditedCourseId}>
                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                <SelectContent>
                    {courses.map(c => <SelectItem key={c._id} value={c._id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="password" className="text-right">New Password</Label>
              <Input id="password" type="password" placeholder="Leave blank to keep unchanged" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        {/* ... (This dialog's code remains the same) */}
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle></AlertDialogHeader>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the student '{studentToDelete?.name}' and all of their attendance records.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       {/* NEW: Update Image Dialog */}
      <Dialog open={isImageUploadOpen} onOpenChange={setIsImageUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Face Image for {studentToUpdateImage?.name}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
              <Label htmlFor="face_image">New Face Image</Label>
              <Input 
                id="face_image" 
                type="file" 
                accept="image/*" 
                onChange={(e) => setFaceImage(e.target.files ? e.target.files[0] : null)} 
              />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={handleImageUpload}>Upload and Update</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Layout>
  );
}