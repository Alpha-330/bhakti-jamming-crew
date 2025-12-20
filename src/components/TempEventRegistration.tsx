import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, Calendar, MapPin, User, Phone, Mail } from "lucide-react";

const TempEventRegistration = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim() || !email.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Basic phone validation (at least 10 digits)
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);

    const { error } = await supabase
      .from("temp_event_registrations")
      .insert({
        name: name.trim(),
        phone_number: phone.trim(),
        email: email.trim().toLowerCase(),
      });

    setIsSubmitting(false);

    if (error) {
      toast.error("Registration failed. Please try again.");
      console.error("Registration error:", error);
    } else {
      setIsRegistered(true);
      toast.success("Registration successful!");
    }
  };

  if (isRegistered) {
    return (
      <section id="dec-event" className="py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <div className="max-w-lg mx-auto text-center">
            <div className="bg-card rounded-2xl border border-border p-8 shadow-lg">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <h2 className="font-display font-bold text-2xl text-secondary mb-2">
                Registration Confirmed!
              </h2>
              <p className="text-muted-foreground mb-4">
                Thank you for registering for our event on 21st December at Atal Udyan.
              </p>
              <div className="bg-muted/50 rounded-lg p-4 text-left space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>21st December 2024</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Atal Udyan (I Love Agra Selfie Point)</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                We'll see you there! 🎉
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="dec-event" className="py-16 bg-gradient-to-b from-primary/5 to-background">
      <div className="container mx-auto px-4">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium mb-3">
              Special Event
            </span>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-secondary mb-2">
              21 Dec Event Registration
            </h2>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>Atal Udyan (I Love Agra Selfie Point)</span>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <User className="w-4 h-4 text-primary" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Registering..." : "Register Now"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TempEventRegistration;
