import { Instagram, Heart } from "lucide-react";
import logo from "@/assets/logo.jpeg";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer id="contact" className="py-16 bg-secondary text-secondary-foreground">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Bhakti Jamming Crew" className="h-12 w-12 rounded-full object-cover" />
              <span className="font-display font-bold text-xl">Bhakti Jamming Crew</span>
            </div>
            <p className="text-secondary-foreground/70 text-sm leading-relaxed">
              Where devotion meets rhythm. Join our community of music lovers spreading joy through spiritual music.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {["Home", "About", "Events", "Gallery"].map((link) => (
                <li key={link}>
                  <a
                    href={`#${link.toLowerCase()}`}
                    className="text-secondary-foreground/70 hover:text-secondary-foreground transition-colors duration-200"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <a
              href="https://chat.whatsapp.com/Dij2SY0OodQ7MXdy9VgX2D?mode=hqrt2"
              target="_blank"
              rel="noopener noreferrer"
              className="font-display font-semibold text-lg mb-4 block hover:text-primary transition-colors duration-200"
            >
              Connect With Us
            </a>
            <div className="space-y-4">
              <a
                href="https://www.instagram.com/bhaktijammingcrew/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-secondary-foreground/70 hover:text-secondary-foreground transition-colors duration-200"
              >
                <Instagram className="w-5 h-5" />
                @bhaktijammingcrew
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-secondary-foreground/20 text-center">
          <p className="text-secondary-foreground/60 text-sm flex items-center justify-center gap-2">
            Made with <Heart className="w-4 h-4 text-primary fill-primary" /> by Bhakti Jamming Crew © {currentYear}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
