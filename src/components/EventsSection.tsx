import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Calendar, Clock, MapPin, Star, Instagram, IndianRupee, Users, Loader2, ArrowRight } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time_start: string;
  time_end: string | null;
  location: string;
  featured: boolean;
  price: number | null;
  max_attendees: number | null;
}

const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(3);

    if (!error && data) {
      setEvents(data);
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
    return {
      day: date.getDate(),
      month: date.toLocaleString("default", { month: "short" }),
    };
  };

  const handleRegister = async (event: Event) => {
    if (!user) {
      toast.error("Please sign in to register for events");
      window.location.href = "/auth";
      return;
    }

    if (!event.price || event.price === 0) {
      // Free event - direct registration
      setRegistering(event.id);
      const { error } = await supabase.from("event_registrations").insert({
        event_id: event.id,
        user_id: user.id,
        amount: 0,
        status: "confirmed",
      });

      if (error) {
        if (error.message.includes("duplicate")) {
          toast.error("You're already registered for this event");
        } else {
          toast.error("Failed to register. Please try again.");
        }
      } else {
        toast.success("Successfully registered!");
      }
      setRegistering(null);
      return;
    }

    // Paid event - initiate Razorpay payment
    setRegistering(event.id);
    try {
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: { eventId: event.id, amount: event.price },
      });

      if (error) throw error;

      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        name: "Bhakti Jamming Crew",
        description: `Registration for ${event.title}`,
        order_id: data.orderId,
        handler: async (response: any) => {
          // Verify payment
          const { error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              eventId: event.id,
            },
          });

          if (verifyError) {
            toast.error("Payment verification failed");
          } else {
            toast.success("Payment successful! You're registered.");
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: "#E07B39",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      toast.error("Failed to initiate payment");
    } finally {
      setRegistering(null);
    }
  };

  if (loading) {
    return (
      <section id="events" className="py-20 md:py-32 bg-background">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-pulse text-muted-foreground">Loading events...</div>
        </div>
      </section>
    );
  }

  return (
    <section id="events" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            <Calendar className="w-4 h-4 inline mr-2" />
            Upcoming Events
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-secondary mb-6">
            Join Our Next
            <span className="text-gradient"> Spiritual Gathering</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Be part of our soulful sessions. Each event is an opportunity to connect,
            sing, and experience the joy of collective devotion.
          </p>
        </div>

        {/* Events Grid */}
        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="font-display font-semibold text-xl text-secondary mb-2">
              No Upcoming Events
            </h3>
            <p className="text-muted-foreground mb-6">
              Stay tuned! Follow us on Instagram for updates on our next gathering.
            </p>
            <a
              href="https://www.instagram.com/bhaktijammingcrew/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:shadow-glow transition-all"
            >
              <Instagram className="w-5 h-5" />
              Follow on Instagram
            </a>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const { day, month } = formatDate(event.date);
              return (
                <div
                  key={event.id}
                  className={`group relative bg-card rounded-2xl border overflow-hidden card-hover ${
                    event.featured ? "border-primary/50 shadow-glow" : "border-border"
                  }`}
                >
                  {event.featured && (
                    <div className="absolute top-4 right-4 z-10">
                      <span className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                        <Star className="w-3 h-3" />
                        Featured
                      </span>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Date Badge */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-xl flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-primary">{day}</span>
                        <span className="text-xs uppercase text-primary/80">{month}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-semibold text-xl text-secondary mb-1 group-hover:text-primary transition-colors">
                          {event.title}
                        </h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {formatTime(event.time_start)}
                          {event.time_end && ` - ${formatTime(event.time_end)}`}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {event.description && (
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {event.description}
                      </p>
                    )}

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>

                    {/* Price & Capacity */}
                    <div className="flex items-center gap-4 mb-4">
                      {event.price && event.price > 0 ? (
                        <span className="flex items-center gap-1 text-sm font-medium text-primary">
                          <IndianRupee className="w-4 h-4" />
                          {event.price}
                        </span>
                      ) : (
                        <span className="text-sm font-medium text-green-600">Free Entry</span>
                      )}
                      {event.max_attendees && (
                        <span className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="w-4 h-4" />
                          {event.max_attendees} spots
                        </span>
                      )}
                    </div>

                    {/* Register Button */}
                    <button
                      onClick={() => handleRegister(event)}
                      disabled={registering === event.id}
                      className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {registering === event.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Processing...
                        </>
                      ) : event.price && event.price > 0 ? (
                        "Register & Pay"
                      ) : (
                        "Register Now"
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        {events.length > 0 && (
          <div className="text-center mt-12">
            <a
              href="https://www.instagram.com/bhaktijammingcrew/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
            >
              <Calendar className="w-5 h-5" />
              Follow us for event updates
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default EventsSection;
