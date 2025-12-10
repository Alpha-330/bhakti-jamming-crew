import { Instagram, ExternalLink } from "lucide-react";

import gallery1 from "@/assets/gallery/gallery-1.jpg";
import gallery2 from "@/assets/gallery/gallery-2.jpg";
import gallery3 from "@/assets/gallery/gallery-3.jpg";
import gallery4 from "@/assets/gallery/gallery-4.jpg";
import gallery5 from "@/assets/gallery/gallery-5.jpg";
import gallery6 from "@/assets/gallery/gallery-6.jpg";
import gallery7 from "@/assets/gallery/gallery-7.jpg";
import gallery8 from "@/assets/gallery/gallery-8.jpg";
import gallery9 from "@/assets/gallery/gallery-9.jpg";

const galleryImages = [
  { id: 1, src: gallery1, alt: "Harmonium kirtan session" },
  { id: 2, src: gallery2, alt: "Vocalist singing bhajans" },
  { id: 3, src: gallery3, alt: "Live bhakti performance" },
  { id: 4, src: gallery4, alt: "Community gathering" },
  { id: 5, src: gallery5, alt: "Audience in devotion" },
  { id: 6, src: gallery6, alt: "Evening kirtan crowd" },
  { id: 7, src: gallery7, alt: "Hands raised in worship" },
  { id: 8, src: gallery8, alt: "Joyful crowd celebration" },
  { id: 9, src: gallery9, alt: "Stage performance" },
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
              <img
                src={image.src}
                alt={image.alt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
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
