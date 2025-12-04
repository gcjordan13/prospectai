
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Building, Users, Globe, ArrowLeft, Download } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

type CompanyData = {
  companies: string[];
  websites: string[];
};

type Contact = {
  name: string;
  title: string;
  company: string;
  email: string;
};

interface ResultsDisplayProps {
  companyData: CompanyData;
  contacts: Contact[];
  onReset: () => void;
}

export default function ResultsDisplay({
  companyData,
  contacts,
  onReset,
}: ResultsDisplayProps) {
  const handleExport = () => {
    const csvHeader = "Name,Title,Company,Email\n";
    const csvRows = contacts.map(c => `${c.name},${c.title},${c.company},${c.email}`).join("\n");
    const csvContent = csvHeader + csvRows;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "prospects.csv");
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex flex-wrap gap-4 justify-between items-center">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Your Prospecting Results</h2>
                <p className="text-muted-foreground mt-1">Here are the companies and contacts that match your criteria.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={onReset} variant="outline">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  New Search
              </Button>
               <Button onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
              </Button>
            </div>
        </div>
      <div className="grid gap-8 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="text-primary" />
              Companies
            </CardTitle>
            <CardDescription>
              Found {companyData.companies.length} relevant companies.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <ul className="space-y-3 pr-4">
                {companyData.companies.map((company, index) => (
                  <li key={index} className="flex items-center justify-between p-2 rounded-md hover:bg-muted">
                    <span className="font-medium text-sm">{company}</span>
                    {companyData.websites[index] && (
                      <Button variant="ghost" size="sm" asChild>
                        <a
                          href={companyData.websites[index]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-accent hover:text-accent-foreground"
                        >
                          <Globe size={14} />
                          Website
                        </a>
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="text-primary" />
              Potential Contacts
            </CardTitle>
            <CardDescription>
              Publicly available contact information from ethical sources.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <ScrollArea className="h-[60vh] border rounded-lg">
                <Table>
                <TableHeader className="sticky top-0 bg-muted">
                    <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Email</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {contacts.map((contact, index) => (
                    <TableRow key={index}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>{contact.title}</TableCell>
                        <TableCell>{contact.company}</TableCell>
                        <TableCell>
                        <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
                            {contact.email}
                        </a>
                        </TableCell>
                    </TableRow>
                    ))}
                </TableBody>
                </Table>
             </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
