import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function MaterialsEmpty() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>No materials yet</CardTitle>
        <CardDescription>
          Upload forms, templates and reference documents the AI should use when preparing work.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button disabled>
          <Upload /> Upload (coming soon)
        </Button>
      </CardContent>
    </Card>
  )
}
