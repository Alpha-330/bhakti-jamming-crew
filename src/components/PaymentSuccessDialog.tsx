import { CheckCircle, Calendar, MapPin, Clock, IndianRupee, PartyPopper } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface PaymentSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  amount: number;
  paymentId: string;
}

const PaymentSuccessDialog = ({
  open,
  onClose,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  amount,
  paymentId,
}: PaymentSuccessDialogProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Payment Successful</DialogTitle>
        </DialogHeader>
        
        <div className="text-center">
          {/* Success Animation */}
          <div className="relative mx-auto w-20 h-20 mb-6">
            <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
            <div className="relative w-20 h-20 bg-green-500 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <PartyPopper className="w-6 h-6 text-primary animate-bounce" />
            <h2 className="font-display text-2xl font-bold text-secondary">
              You're In!
            </h2>
            <PartyPopper className="w-6 h-6 text-primary animate-bounce" style={{ animationDelay: "0.1s" }} />
          </div>
          
          <p className="text-muted-foreground mb-6">
            Payment successful! Your spot is confirmed.
          </p>

          {/* Event Details Card */}
          <div className="bg-muted/50 rounded-xl p-4 text-left mb-6">
            <h3 className="font-semibold text-lg text-secondary mb-3">
              {eventTitle}
            </h3>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4 text-primary" />
                {formatDate(eventDate)}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4 text-primary" />
                {formatTime(eventTime)}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary" />
                {eventLocation}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Amount Paid</span>
              <span className="flex items-center gap-1 font-semibold text-green-600">
                <IndianRupee className="w-4 h-4" />
                {amount}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Payment ID: {paymentId}
          </p>

          <Button onClick={onClose} className="w-full">
            Awesome, Got it!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentSuccessDialog;
