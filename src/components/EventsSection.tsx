import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";

const events = [
  {
    id: 1,
    title: "Weekend Kirtan Session",
    date: "December 7, 2025",
    time: "6:00 PM - 9:00 PM",
    location: "Community Hall, Mumbai",
    description: "Join us for an evening of soulful kirtan and bhajans. All are welcome!",
    featured: true,
  },
  {
    id: 2,
    title: "New Year Special Bhajan Night",
    date: "December 31, 2025",
    time: "10:00 PM - 1:00 AM",
    location: "Temple Grounds",
    description: "Welcome the new year with divine music and positive vibrations.",
    featured: false,
  },
  {
    id: 3,
    title: "Monthly Community Jam",
    date: "January 14, 2026",
    time: "5:00 PM - 8:00 PM",
    location: "Open Air Venue",
    description: "Our regular monthly gathering for devotional music lovers.",
    featured: false,
  },
];

const EventsSection = () => {
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
        <div className="space-y-6 max-w-4xl mx-auto">
          {events.map((event, index) => (
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
                  <span className="text-2xl font-bold">{event.date.split(" ")[1].replace(",", "")}</span>
                  <span className="text-xs uppercase">{event.date.split(" ")[0]}</span>
                </div>

                {/* Event Details */}
                <div className="flex-grow">
                  <h3 className="font-display font-semibold text-xl md:text-2xl text-secondary mb-2">
                    {event.title}
                  </h3>
                  <p className="text-muted-foreground mb-4">{event.description}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      <span>{event.time}</span>
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
          ))}
        </div>

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
