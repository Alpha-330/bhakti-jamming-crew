import { useState, useEffect } from "react";
import { Music, Users, Heart, Mic2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import daiwikImg from "@/assets/founders/daiwik.jpg";
import piyushImg from "@/assets/founders/piyush.jpg";

const features = [
  {
    icon: Music,
    title: "Soulful Music",
    description: "Traditional bhajans and kirtans performed with authentic instruments and heartfelt devotion.",
  },
  {
    icon: Users,
    title: "Community",
    description: "A welcoming space for everyone to connect, learn, and grow together through music.",
  },
  {
    icon: Heart,
    title: "Pure Devotion",
    description: "Every session is an offering, creating an atmosphere of peace and spiritual connection.",
  },
  {
    icon: Mic2,
    title: "Live Sessions",
    description: "Regular jamming sessions where musicians and devotees come together to create magic.",
  },
];

const founders = [
  {
    name: "Daiwik Agarwal",
    role: "Co-Founder",
    image: daiwikImg,
    bio: "What began as a small idea has now become a beautiful family connected through devotion and music. Our mission is to create a space where positive energy flows, voices unite, and strangers become family. 🙏✨",
  },
  {
    name: "Piyush Hardasani",
    role: "Co-Founder",
    image: piyushImg,
    bio: "Music and creativity are the shortest bridges between two souls. We aren't just building a group; we are building a movement of joy. Let's keep the harmony flowing—one beat at a time! 🌟",
  },
];

const AboutSection = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("*");
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s) => (map[s.key] = s.value));
        setSettings(map);
      }
    };
    fetchSettings();
  }, []);

  return (
    <section id="about" className="py-20 md:py-32 bg-card">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-4">
            About Us
          </span>
          <h2 className="font-display font-bold text-3xl md:text-5xl text-secondary mb-6">
            Spreading Joy Through
            <span className="text-gradient"> Devotional Music</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            {settings.about_description || "Bhakti Jamming Crew is a passionate group of musicians and devotees united by our love for spiritual music. We believe in the transformative power of kirtan and bhajan to bring peace, joy, and connection to all."}
          </p>
        </div>

        {/* Founders Section */}
        <div className="mb-20">
          <h3 className="font-display font-bold text-2xl md:text-3xl text-secondary text-center mb-10">
            Meet Our <span className="text-gradient">Founders</span>
          </h3>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-16">
            {founders.map((founder) => (
              <div key={founder.name} className="group text-center">
                <div className="relative mb-4 flex justify-center">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-accent/30 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300">
                    <img
                      src={founder.image}
                      alt={founder.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <h4 className="font-display font-semibold text-xl text-secondary">
                  {founder.name}
                </h4>
                <p className="text-primary font-medium text-sm mb-2">
                  {founder.role}
                </p>
                <p className="text-muted-foreground text-sm max-w-[200px]">
                  {founder.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group p-6 bg-background rounded-2xl border border-border card-hover"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-xl text-secondary mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Mission Statement */}
        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 rounded-3xl" />
          <div className="relative p-8 md:p-12 text-center">
            <blockquote className="font-display text-2xl md:text-3xl text-secondary italic max-w-4xl mx-auto">
              "{settings.mission_quote || "Music is the language of the soul. When we jam together in devotion, we create a bridge between the earthly and the divine."}"
            </blockquote>
            <p className="mt-6 text-muted-foreground font-medium">— Bhakti Jamming Crew</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
