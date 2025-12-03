import { Instagram, ExternalLink } from "lucide-react";

const galleryImages = [
  {
    id: 1,
    alt: "Kirtan session with harmonium",
    gradient: "from-primary/80 to-accent/60",
    icon: "🎹",
  },
  {
    id: 2,
    alt: "Group bhajan performance",
    gradient: "from-secondary/80 to-brown-light/60",
    icon: "🎤",
  },
  {
    id: 3,
    alt: "Dholak rhythm session",
    gradient: "from-accent/80 to-primary/60",
    icon: "🪘",
  },
  {
    id: 4,
    alt: "Community gathering",
    gradient: "from-brown-light/80 to-secondary/60",
    icon: "🙏",
  },
  {
    id: 5,
    alt: "Evening kirtan",
    gradient: "from-primary/70 to-secondary/50",
    icon: "🌅",
  },
  {
    id: 6,
    alt: "Musical instruments",
    gradient: "from-accent/70 to-primary/50",
    icon: "🎶",
  },
];

const GallerySection = () => {
  return (
    <section id="gallery" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            Gallery
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-secondary mb-6">
            Moments of
            <span className="text-gradient"> Devotion</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Glimpses from our jamming sessions and community gatherings.
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer ${
                index === 0 ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${image.gradient}`} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl md:text-6xl opacity-50">{image.icon}</span>
              </div>
              <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/40 transition-all duration-300 flex items-center justify-center">
                <ExternalLink className="w-8 h-8 text-secondary-foreground opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300" />
              </div>
            </div>
          ))}
        </div>

        {/* Instagram CTA */}
        <div className="mt-12 text-center">
          <a
            href="https://www.instagram.com/bhaktijammingcrew/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-accent text-primary-foreground rounded-xl font-semibold hover:shadow-glow transition-all duration-300 hover:-translate-y-1"
          >
            <Instagram className="w-5 h-5" />
            See more on Instagram
          </a>
        </div>
      </div>
    </section>
  );
};

export default GallerySection;
