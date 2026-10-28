import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { PageHeader } from '@/components/layout/page-header'
import { MaterialsEmpty, MaterialsList, materialsQuery, UploadButton } from '@/features/materials'

export const Route = createFileRoute('/_app/materials')({
  loader: ({ context }) => context.queryClient.ensureQueryData(materialsQuery()),
  component: MaterialsPage,
})

function MaterialsPage() {
  const { data: materials } = useSuspenseQuery(materialsQuery())
  return (
    <>
      <PageHeader
        title="Materials"
        description="Forms and templates the AI pre-fills when an email calls for one."
        actions={<UploadButton />}
      />
      {materials.length === 0 ? <MaterialsEmpty /> : <MaterialsList materials={materials} />}
    </>
  )
}
