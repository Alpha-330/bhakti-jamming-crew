import { Instagram, Music, Heart } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const HeroSection = () => {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden"
      style={{ background: "var(--gradient-hero)" }}
    >
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center text-center">
          {/* Logo */}
          <div className="mb-8 animate-float">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl scale-110" />
              <img
                src={logo}
                alt="Bhakti Jamming Crew Logo"
                className="relative w-40 h-40 md:w-56 md:h-56 rounded-full object-cover shadow-glow"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="font-display font-bold text-4xl md:text-6xl lg:text-7xl text-secondary mb-4 animate-fade-up">
            Bhakti Jamming Crew
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            Where devotion meets rhythm. Join us in creating soulful music that connects hearts and elevates spirits.
          </p>

          {/* Tags */}
          <div className="flex flex-wrap justify-center gap-3 mb-10 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            {["Kirtan", "Bhajan", "Live Sessions", "Community"].map((tag) => (
              <span
                key={tag}
                className="px-4 py-2 bg-card rounded-full text-sm font-medium text-secondary border border-border"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <a
              href="https://www.instagram.com/bhaktijammingcrew/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-xl font-semibold hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
            >
              <Instagram className="w-5 h-5" />
              Follow on Instagram
            </a>
            <a
              href="#events"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-card text-secondary border-2 border-secondary rounded-xl font-semibold hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
            >
              <Music className="w-5 h-5" />
              Upcoming Events
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 md:gap-16 mt-16 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <div className="text-center">
              <div className="font-display font-bold text-3xl md:text-4xl text-primary">50+</div>
              <div className="text-sm text-muted-foreground mt-1">Sessions</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-3xl md:text-4xl text-primary">500+</div>
              <div className="text-sm text-muted-foreground mt-1">Community</div>
            </div>
            <div className="text-center">
              <div className="font-display font-bold text-3xl md:text-4xl text-primary">
                <Heart className="w-8 h-8 md:w-10 md:h-10 inline" />
              </div>
              <div className="text-sm text-muted-foreground mt-1">Pure Bhakti</div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-secondary/30 rounded-full flex justify-center pt-2">
          <div className="w-1 h-2 bg-secondary/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
