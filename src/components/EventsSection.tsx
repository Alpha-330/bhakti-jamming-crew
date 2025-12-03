import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time_start: string;
  time_end: string | null;
  location: string;
  featured: boolean;
}

const EventsSection = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .gte("date", new Date().toISOString().split("T")[0])
        .order("date", { ascending: true })
        .limit(3);

      if (!error && data) {
        setEvents(data);
      }
      setLoading(false);
    };

    fetchEvents();
  }, []);

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
      month: date.toLocaleString("en", { month: "short" }),
    };
  };

  return (
    <section id="events" className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Events
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-secondary mb-6">
            Upcoming
            <span className="text-gradient"> Jamming Sessions</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Don't miss out on our upcoming events. Join us and be part of the musical journey!
          </p>
        </div>

        {/* Events List */}
        {loading ? (
          <div className="text-center text-muted-foreground">Loading events...</div>
        ) : events.length === 0 ? (
          <div className="text-center text-muted-foreground max-w-md mx-auto">
            <p>No upcoming events scheduled at the moment. Follow us on Instagram for updates!</p>
          </div>
        ) : (
          <div className="space-y-6 max-w-4xl mx-auto">
            {events.map((event) => {
              const { day, month } = formatDate(event.date);
              const timeRange = event.time_end
                ? `${formatTime(event.time_start)} - ${formatTime(event.time_end)}`
                : formatTime(event.time_start);

              return (
                <div
                  key={event.id}
                  className={`group relative p-6 md:p-8 rounded-2xl border transition-all duration-300 hover:-translate-y-1 ${
                    event.featured
                      ? "bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30"
                      : "bg-card border-border"
                  }`}
                >
                  {event.featured && (
                    <span className="absolute top-4 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                      Featured
                    </span>
                  )}

                  <div className="flex flex-col md:flex-row md:items-center gap-6">
                    {/* Date Box */}
                    <div className="flex-shrink-0 w-20 h-20 bg-secondary text-secondary-foreground rounded-xl flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold">{day}</span>
                      <span className="text-xs uppercase">{month}</span>
                    </div>

                    {/* Event Details */}
                    <div className="flex-grow">
                      <h3 className="font-display font-semibold text-xl md:text-2xl text-secondary mb-2">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-muted-foreground mb-4">{event.description}</p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <span>{timeRange}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>{event.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
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
      </div>
    </section>
  );
};

export default EventsSection;
