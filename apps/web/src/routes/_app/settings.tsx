import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_app/settings')({
  component: () => (
    <>
      <PageHeader title="Settings" />
      <Card>
        <CardHeader>
          <CardTitle>Connected accounts</CardTitle>
          <CardDescription>Connect Outlook to start (Gmail later).</CardDescription>
        </CardHeader>
      </Card>
    </>
  ),
})
