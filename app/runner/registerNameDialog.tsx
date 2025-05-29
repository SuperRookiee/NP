import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog'
import {Input} from '@/components/ui/input'
import {Button} from '@/components/ui/button'

interface RegisterNameDialogProps {
    open: boolean
    name: string
    setName: (name: string) => void
    onSubmit: () => void
    onOpenChange: (open: boolean) => void
}

export default function RegisterNameDialog({open, name, setName, onSubmit, onOpenChange}: RegisterNameDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="p-6 rounded-xl">
                <DialogHeader>
                    <DialogTitle>닉네임을 입력하세요</DialogTitle>
                </DialogHeader>
                <Input
                    placeholder="닉네임"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="my-4"
                />
                <Button onClick={onSubmit} className="w-full">저장</Button>
            </DialogContent>
        </Dialog>
    )
}