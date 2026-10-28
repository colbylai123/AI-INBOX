import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function MaterialsEmpty() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>No materials yet</CardTitle>
        <CardDescription>
          Upload the forms and templates you fill out again and again. When an email calls for one,
          the AI pre-fills it for you to review.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
