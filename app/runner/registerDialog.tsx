import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'

interface RegisterNameDialogProps {
    open: boolean
    name: string
    setName: (name: string) => void
    onSubmit: () => void
    onOpenChange: (open: boolean) => void
    onSkip: () => void // 추가된 prop
}

export default function RegisterDialog({open, name, setName, onSubmit, onOpenChange, onSkip}: RegisterNameDialogProps) {
    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) onSkip()
        onOpenChange(nextOpen)
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="p-6 rounded-xl">
                <DialogHeader>
                    <DialogTitle>닉네임을 입력하세요</DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        게임 결과를 저장할 이름을 입력하세요.
                    </DialogDescription>
                </DialogHeader>
                <Input
                    placeholder="닉네임"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="my-4"
                />
                <div className="flex gap-2">
                    <Button onClick={onSubmit} className="w-full">
                        저장
                    </Button>
                    <Button onClick={onSkip} variant="secondary" className="w-full">
                        저장 없이 다시하기
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}