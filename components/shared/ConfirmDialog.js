'use client';
import { AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

export default function ConfirmDialog({ open, onClose, onConfirm, title, description, confirmLabel = 'Confirm', variant = 'destructive', isLoading }) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <DialogTitle className="text-base">{title}</DialogTitle>
          </div>
        </DialogHeader>
        <p className="text-sm text-sail-text-secondary pl-13 ml-1">{description}</p>
        <DialogFooter className="gap-2 sm:gap-2 mt-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={isLoading}
            className={variant === 'destructive' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
          >
            {isLoading ? 'Please wait...' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
