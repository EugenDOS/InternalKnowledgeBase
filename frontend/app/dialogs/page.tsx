import DialogsPageView from "@/components/dialogs/dialogs-page-view"
import { getAllArticles } from "@/lib/backend-data"
import { dialogThreads } from "@/lib/dialogs"

export const dynamic = "force-dynamic"

export default async function DialogsPage() {
  const articles = await getAllArticles()

  return <DialogsPageView initialThreads={dialogThreads} articles={articles} />
}
