'use client';

import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Upload, FileSearch, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, unwrap } from '@/lib/api';
import { cn, scoreColor } from '@/lib/utils';

interface AnalyzedResume {
  id: string;
  title: string;
  score: number | null;
  weakAreas: string[];
  recommendations: string[];
  parsed: { skills?: string[] };
}

export default function ResumeAnalyzerPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData();
      form.append('file', file);
      form.append('title', file.name);
      return unwrap<AnalyzedResume>(
        api.post('/resumes/upload', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
        }),
      );
    },
    onSuccess: () => toast.success('Resume analyzed!'),
    onError: (e: Error) => toast.error(e.message),
  });

  const onFile = (file?: File) => {
    if (!file) return;
    const ok = ['application/pdf', 'text/plain'].includes(file.type) || file.name.endsWith('.docx');
    if (!ok) return toast.error('Upload a PDF, DOCX, or TXT file');
    mutation.mutate(file);
  };

  const result = mutation.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <FileSearch className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Resume Analyzer</h1>
          <p className="text-muted-foreground">Upload your resume for an instant AI score.</p>
        </div>
      </div>

      <Card
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          onFile(e.dataTransfer.files?.[0]);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center border-2 border-dashed py-16 transition-colors',
          dragOver ? 'border-primary bg-primary/5' : 'border-border',
        )}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
        {mutation.isPending ? (
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        ) : (
          <Upload className="h-10 w-10 text-primary" />
        )}
        <p className="mt-4 font-medium">
          {mutation.isPending ? 'Analyzing your resume…' : 'Drag & drop or click to upload'}
        </p>
        <p className="text-sm text-muted-foreground">PDF, DOCX, or TXT · up to 10MB</p>
      </Card>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-3"
        >
          <Card className="flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground">Overall Score</p>
            <p className={cn('text-6xl font-bold', scoreColor(result.score ?? 0))}>
              {result.score ?? '—'}
            </p>
            <p className="text-sm text-muted-foreground">out of 100</p>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Apply these to raise your score</CardDescription>
            </CardHeader>
            <ul className="space-y-2">
              {result.recommendations.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                  {r}
                </li>
              ))}
            </ul>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
