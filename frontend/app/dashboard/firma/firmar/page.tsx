'use client';

import React, { Suspense } from 'react';
import { SignatureWizard } from '@/components/firma/SignatureWizard';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

function FirmarDocumentoContent() {
  return <SignatureWizard />;
}

export default function FirmarDocumentoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-[calc(100vh-6rem)]">
          <div className="px-6 lg:px-8 py-6 border-b border-slate-200 bg-white">
            <div className="flex items-start justify-between">
              <div>
                <Skeleton className="h-10 w-96 mb-2" />
                <Skeleton className="h-6 w-80" />
              </div>
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
          <div className="px-6 lg:px-8 py-6 bg-white border-b border-slate-200">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardContent className="pt-6">
                <Skeleton className="h-2 w-full mb-6" />
                <div className="flex justify-between items-center">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex flex-col items-center flex-1">
                      <Skeleton className="w-10 h-10 rounded-full mb-2" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="h-full grid grid-cols-1 lg:grid-cols-3 gap-0">
              <div className="lg:col-span-2 overflow-y-auto border-r border-slate-200 p-6 lg:p-8">
                <Skeleton className="h-6 w-48 mb-4" />
                <Skeleton className="h-10 w-full mb-4" />
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-24 w-full mb-3" />
                ))}
              </div>
              <div className="hidden lg:block overflow-y-auto bg-slate-50 p-6 lg:p-8">
                <Skeleton className="h-6 w-24 mb-6" />
                <Skeleton className="h-40 w-full" />
              </div>
            </div>
          </div>
        </div>
      }
    >
      <FirmarDocumentoContent />
    </Suspense>
  );
}
