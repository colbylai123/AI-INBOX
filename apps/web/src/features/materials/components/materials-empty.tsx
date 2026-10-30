import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function MaterialsEmpty() {
  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>No materials yet</CardTitle>
        <CardDescription>
          Upload the forms you fill out again and again, and documents like a price list to fill
          them from. When an email calls for a form, the AI pre-fills it for you to review.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
