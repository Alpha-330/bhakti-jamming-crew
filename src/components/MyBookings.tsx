import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, MapPin, IndianRupee, Ticket, CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Registration {
  id: string;
  event_id: string;
  amount: number;
  status: string;
  razorpay_payment_id: string | null;
  created_at: string;
  event: {
    title: string;
    date: string;
    time_start: string;
    location: string;
  } | null;
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && open) {
      fetchBookings();
    }
  }, [user, open]);

  const fetchBookings = async () => {
    if (!user) return;
    
    setLoading(true);
    const { data, error } = await supabase
      .from("event_registrations")
      .select(`
        id,
        event_id,
        amount,
        status,
        razorpay_payment_id,
        created_at,
        events (
          title,
          date,
          time_start,
          location
        )
      `)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      // Transform data to flatten the event relationship
      const transformedData = data.map((reg: any) => ({
        ...reg,
        event: reg.events,
      }));
      setBookings(transformedData);
    }
    setLoading(false);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Ticket className="w-4 h-4" />
          My Bookings
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="w-5 h-5 text-primary" />
            My Event Bookings
          </DialogTitle>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Ticket className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No bookings yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Register for events to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className={`p-4 rounded-xl border ${
                  booking.status === "confirmed"
                    ? "border-green-500/30 bg-green-500/5"
                    : booking.status === "pending"
                    ? "border-yellow-500/30 bg-yellow-500/5"
                    : "border-red-500/30 bg-red-500/5"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-secondary">
                      {booking.event?.title || "Event"}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Booked on {formatDate(booking.created_at)}
                    </p>
                  </div>
                  <span
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === "confirmed"
                        ? "bg-green-500/20 text-green-600"
                        : booking.status === "pending"
                        ? "bg-yellow-500/20 text-yellow-600"
                        : "bg-red-500/20 text-red-600"
                    }`}
                  >
                    {booking.status === "confirmed" ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : booking.status === "pending" ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </span>
                </div>

                {booking.event && (
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {formatDate(booking.event.date)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatTime(booking.event.time_start)}
                    </div>
                    <div className="flex items-center gap-1.5 col-span-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {booking.event.location}
                    </div>
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm font-medium">
                    <IndianRupee className="w-3.5 h-3.5" />
                    {booking.amount}
                  </span>
                  {booking.razorpay_payment_id && (
                    <span className="text-xs text-muted-foreground">
                      Payment ID: {booking.razorpay_payment_id.slice(0, 12)}...
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MyBookings;
