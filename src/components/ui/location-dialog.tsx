import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin } from "lucide-react";

interface LocationDialogProps {
  address: string;
  children: React.ReactNode;
}

export const LocationDialog = ({ address, children }: LocationDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localização
          </DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground mb-2">Endereço completo:</p>
          <p className="text-base">{address}</p>
        </div>
      </DialogContent>
    </Dialog>
  );
};