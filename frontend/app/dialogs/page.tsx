import DialogsPageView from "@/components/dialogs/dialogs-page-view"
import { getAllArticles } from "@/lib/db"
import { dialogThreads } from "@/lib/dialogs"

export default async function DialogsPage() {
  const articles = await getAllArticles()

  return <DialogsPageView initialThreads={dialogThreads} articles={articles} />
}
