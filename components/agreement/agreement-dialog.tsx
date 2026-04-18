"use client"

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { confirmAgreement, resetAgreement, setAccepted } from "@/store/slices/agreement-slice"

interface AgreementDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  isSubmitting: boolean
}

export default function AgreementDialog({
  open,
  onOpenChange,
  onConfirm,
  isSubmitting,
}: AgreementDialogProps) {
  const dispatch = useAppDispatch()
  const agreement = useAppSelector((state) => state.agreement)

  function handleClose(nextOpen: boolean) {
    onOpenChange(nextOpen)

    if (!nextOpen) {
      dispatch(resetAgreement())
    }
  }

  function handleConfirm() {
    dispatch(confirmAgreement())
    onConfirm()
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-lg"
        onPointerDownOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Пользовательское соглашение</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-3 text-sm leading-6 text-foreground">
            <p>
              Пользователь обязуется использовать корпоративную базу знаний только
              в рабочих целях и не передавать внутренние материалы третьим лицам.
            </p>
            <p>
              При работе с системой необходимо соблюдать актуальные правила
              хранения, редактирования и публикации внутренних документов.
            </p>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-border p-4">
            <Checkbox
              id="agreement"
              checked={agreement.isAccepted}
              onCheckedChange={(checked) => dispatch(setAccepted(Boolean(checked)))}
            />
            <div className="space-y-1">
              <Label htmlFor="agreement" className="text-sm font-medium text-foreground">
                Я принимаю условия пользовательского соглашения
              </Label>
              <p className="text-sm text-muted-foreground">
                После подтверждения регистрация на этом устройстве будет завершена.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleClose(false)}>
            Отмена
          </Button>
          <Button onClick={handleConfirm} disabled={!agreement.isAccepted || isSubmitting}>
            {isSubmitting ? "Подтверждение..." : "Принять и продолжить"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
