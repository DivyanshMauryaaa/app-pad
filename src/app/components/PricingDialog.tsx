import { Dialog, DialogContent } from '@/components/ui/dialog';
import PricingPage from '@/app/apps/[id]/pricing/page';
import { X } from 'lucide-react';

interface PricingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: string;
}

export default function PricingDialog({ open, onOpenChange, appId }: PricingDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="fixed inset-0 z-50 flex flex-col bg-background p-0 max-w-none w-screen h-screen overflow-y-auto">
        <button
          className="absolute top-4 right-4 z-50 bg-muted rounded-full p-2 hover:bg-accent focus:outline-none"
          onClick={() => onOpenChange(false)}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 flex items-center justify-center w-full h-full p-4">
          <div className="w-full max-w-4xl mx-auto bg-background rounded-lg shadow-lg overflow-y-auto p-6">
            <PricingPage appId={appId} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 