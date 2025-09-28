import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
      <h1 className="text-9xl font-extrabold text-gray-800 tracking-widest">404</h1>
      <div className="bg-blue-600 px-2 text-sm rounded rotate-12 absolute">
        Page Not Found
      </div>
      <Button asChild className="mt-5">
        <Link to="/">Go Home</Link>
      </Button>
    </div>
  );
}