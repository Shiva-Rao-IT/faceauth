import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface StatsCardProps {
    title: string;
    value: string | number;
    description: string;
}

export default function StatsCard({ title, value, description }: StatsCardProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}