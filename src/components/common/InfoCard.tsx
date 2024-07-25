import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

interface InfoCardProps {
  title: string;
  lines: string[];
}

export function InfoCard({ title, lines }: InfoCardProps) {
  return (
    <div className="flex flex-col">
      <Card className="flex h-full flex-col">
        <CardHeader className="flex flex-row items-center">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          {lines.map((line, index) => (
            <p key={index} className="text-xs text-muted-foreground">
              {line}
            </p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
