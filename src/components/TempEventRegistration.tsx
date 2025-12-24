import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle, Calendar, MapPin, User, Phone, Mail, HelpCircle, Download } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from "qrcode.react";

interface RegistrationData {
  bookingCode: string;
  name: string;
}

const TempEventRegistration = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [otherSource, setOtherSource] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !phone.trim() || !email.trim() || !referralSource) {
      toast.error("Please fill in all fields");
      return;
    }

    if (referralSource === "other" && !otherSource.trim()) {
      toast.error("Please specify how you heard about us");
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

    const finalReferralSource = referralSource === "other" ? otherSource.trim() : referralSource;

    const { data, error } = await supabase
      .from("temp_event_registrations")
      .insert({
        name: name.trim(),
        phone_number: phone.trim(),
        email: email.trim().toLowerCase(),
        referral_source: finalReferralSource,
      })
      .select("booking_code")
      .single();

    setIsSubmitting(false);

    if (error) {
      toast.error("Registration failed. Please try again.");
      console.error("Registration error:", error);
    } else {
      setRegistrationData({
        bookingCode: data.booking_code,
        name: name.trim(),
      });
      toast.success("Registration successful!");
    }
  };

  const downloadQRCode = () => {
    const svg = document.getElementById("booking-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `BJC-Booking-${registrationData?.bookingCode}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };
    
    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  if (registrationData) {
    const qrValue = `BJC:${registrationData.bookingCode}`;
    
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
              <p className="text-muted-foreground mb-6">
                Thank you for registering, <span className="font-semibold text-foreground">{registrationData.name}</span>!
              </p>
              
              {/* QR Code Section */}
              <div className="bg-background rounded-xl p-6 mb-6 border border-border">
                <p className="text-sm font-medium mb-4">Your Entry QR Code</p>
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg">
                    <QRCodeSVG 
                      id="booking-qr-code"
                      value={qrValue} 
                      size={180}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>
                <div className="bg-primary/10 rounded-lg p-3 mb-4">
                  <p className="text-xs text-muted-foreground mb-1">Booking Code</p>
                  <p className="font-mono text-2xl font-bold text-primary tracking-wider">
                    {registrationData.bookingCode}
                  </p>
                </div>
                <button
                  onClick={downloadQRCode}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg text-sm font-medium hover:bg-secondary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download QR Code
                </button>
              </div>
              
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
                Show this QR code at the entry for quick check-in! 🎉
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

              <div>
                <label className="flex items-center gap-2 text-sm font-medium mb-3">
                  <HelpCircle className="w-4 h-4 text-primary" />
                  How did you hear about us? *
                </label>
                <RadioGroup value={referralSource} onValueChange={setReferralSource} className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="instagram" id="instagram" />
                    <Label htmlFor="instagram" className="cursor-pointer flex-1">Instagram</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="friend" id="friend" />
                    <Label htmlFor="friend" className="cursor-pointer flex-1">Friend Recommendation</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="whatsapp" id="whatsapp" />
                    <Label htmlFor="whatsapp" className="cursor-pointer flex-1">WhatsApp</Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                    <RadioGroupItem value="other" id="other" />
                    <Label htmlFor="other" className="cursor-pointer flex-1">Other</Label>
                  </div>
                </RadioGroup>
                {referralSource === "other" && (
                  <input
                    type="text"
                    value={otherSource}
                    onChange={(e) => setOtherSource(e.target.value)}
                    placeholder="Please specify..."
                    className="w-full mt-3 px-4 py-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  />
                )}
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
