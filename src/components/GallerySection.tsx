import { useState } from "react";
import { Instagram, X, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";

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
  { id: 1, src: gallery1, alt: "Harmonium kirtan session", size: "large" },
  { id: 2, src: gallery2, alt: "Vocalist singing bhajans", size: "small" },
  { id: 3, src: gallery3, alt: "Live bhakti performance", size: "small" },
  { id: 4, src: gallery4, alt: "Community gathering", size: "small" },
  { id: 5, src: gallery5, alt: "Audience in devotion", size: "large" },
  { id: 6, src: gallery6, alt: "Evening kirtan crowd", size: "small" },
  { id: 7, src: gallery7, alt: "Hands raised in worship", size: "small" },
  { id: 8, src: gallery8, alt: "Joyful crowd celebration", size: "large" },
  { id: 9, src: gallery9, alt: "Stage performance", size: "small" },
];

const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const openLightbox = (index: number) => setSelectedImage(index);
  const closeLightbox = () => setSelectedImage(null);

  const goToPrev = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === 0 ? galleryImages.length - 1 : selectedImage - 1);
    }
  };

  const goToNext = () => {
    if (selectedImage !== null) {
      setSelectedImage(selectedImage === galleryImages.length - 1 ? 0 : selectedImage + 1);
    }
  };

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

        {/* Gallery Grid - Rearranged layout */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {galleryImages.map((image, index) => (
            <div
              key={image.id}
              onClick={() => openLightbox(index)}
              className={`group relative aspect-square rounded-2xl overflow-hidden cursor-pointer ${
                image.size === "large" ? "md:col-span-2 md:row-span-2" : ""
              }`}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-secondary/0 group-hover:bg-secondary/40 transition-all duration-300 flex items-center justify-center">
                <span className="text-secondary-foreground opacity-0 group-hover:opacity-100 transform scale-50 group-hover:scale-100 transition-all duration-300 text-sm font-medium">
                  View
                </span>
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

      {/* Lightbox Modal */}
      <Dialog open={selectedImage !== null} onOpenChange={closeLightbox}>
        <DialogContent className="max-w-5xl w-full bg-background/95 backdrop-blur-md border-border p-0 overflow-hidden">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 z-50 p-2 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {selectedImage !== null && (
            <div className="relative flex items-center justify-center min-h-[60vh]">
              {/* Previous Button */}
              <button
                onClick={goToPrev}
                className="absolute left-4 z-40 p-2 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              {/* Image */}
              <img
                src={galleryImages[selectedImage].src}
                alt={galleryImages[selectedImage].alt}
                className="max-h-[80vh] max-w-full object-contain"
              />

              {/* Next Button */}
              <button
                onClick={goToNext}
                className="absolute right-4 z-40 p-2 rounded-full bg-background/80 text-foreground hover:bg-background transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-background/80 text-foreground text-sm">
                {selectedImage + 1} / {galleryImages.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default GallerySection;
