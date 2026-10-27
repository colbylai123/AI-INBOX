import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute('/_app/settings')({
  component: () => (
    <>
      <PageHeader title="Settings" description="Accounts and preferences." />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Connected accounts</CardTitle>
          <CardDescription>Connect Outlook to start (Gmail later).</CardDescription>
        </CardHeader>
        <CardContent>
          <Button disabled>Connect Outlook (coming soon)</Button>
        </CardContent>
      </Card>
    </>
  ),
})
