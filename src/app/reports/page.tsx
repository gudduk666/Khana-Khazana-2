'use client'

import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

const REPORTS = [
  { label: 'Sales Report', href: '/reports/sales-report' },
  { label: 'Item Wise', href: '/reports/item-wise' },
  { label: 'Category Wise', href: '/reports/category-wise' },
  { label: 'Daily Report', href: '/reports/daily-report' },
]

export default function ReportsIndexPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Reports</h1>
            <p className="text-sm text-gray-600">Select a report to view detailed analytics.</p>
          </div>
          <Link href="/" className="inline-flex">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {REPORTS.map((report) => (
            <Link key={report.href} href={report.href} className="block">
              <Card className="border-gray-200 hover:shadow-md transition-shadow duration-150">
                <CardHeader className="p-4">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-[#1E5BA8]" />
                    <CardTitle className="text-base">{report.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 text-sm text-gray-600">View the {report.label.toLowerCase()} in a dedicated page.</CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
