import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface InfoCardProps {
  title: string;
  lines: string[];
  badge?: React.ReactNode;
}

export function InfoCard({ title, lines, badge }: InfoCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {badge && badge}
      </CardHeader>
      <CardContent className="flex-grow">
        {lines.map((line, index) => (
          <p key={index} className="text-xs text-muted-foreground">
            {line}
          </p>
        ))}
      </CardContent>
    </Card>
  );
}
