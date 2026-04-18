import Link from "next/link"
import DialogPageView from "@/components/dialogs/dialog-page-view"
import { getDialogThreadById } from "@/lib/dialogs"

interface DialogPageProps {
  params: Promise<{ id: string }>
}

export default async function DialogPage({ params }: DialogPageProps) {
  const { id } = await params
  const thread = getDialogThreadById(id)

  return <DialogPageView threadId={id} initialThread={thread} />
}
