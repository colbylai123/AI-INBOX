import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { MaterialsEmpty } from '@/features/materials'

export const Route = createFileRoute('/_app/materials')({
  component: () => (
    <>
      <PageHeader title="Materials" description="Forms, templates and reference docs." />
      <MaterialsEmpty />
    </>
  ),
})
