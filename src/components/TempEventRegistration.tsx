import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { CheckCircle, Calendar, MapPin, User, Phone, Mail, HelpCircle, Download, IndianRupee } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { QRCodeSVG } from "qrcode.react";

interface RegistrationData {
  bookingCode: string;
  name: string;
  paymentId?: string;
}

const EVENT_PRICE = 49;
const EVENT_ID = "0fe20b10-6d75-4094-8590-95139b3bf554"; // 11 Jan event ID

const TempEventRegistration = () => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [referralSource, setReferralSource] = useState("");
  const [otherSource, setOtherSource] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const { user } = useAuth();

  // Load Razorpay SDK
  useEffect(() => {
    if (typeof (window as any).Razorpay !== 'undefined') {
      setRazorpayLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    document.body.appendChild(script);
  }, []);

  const validateForm = () => {
    if (!name.trim() || !phone.trim() || !email.trim() || !referralSource) {
      toast.error("Please fill in all fields");
      return false;
    }

    if (referralSource === "other" && !otherSource.trim()) {
      toast.error("Please specify how you heard about us");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return false;
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      toast.error("Please enter a valid phone number");
      return false;
    }

    return true;
  };

  const saveRegistration = async (paymentId?: string) => {
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

    if (error) {
      console.error("Registration error:", error);
      throw error;
    }

    return data.booking_code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    if (!user) {
      toast.error("Please sign in to register and pay");
      window.location.href = "/auth";
      return;
    }

    if (!razorpayLoaded) {
      toast.error("Payment gateway is loading. Please try again in a moment.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create Razorpay order
      console.log("Creating Razorpay order...");
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: { eventId: EVENT_ID, amount: EVENT_PRICE },
      });

      if (error || !data?.orderId) {
        console.error("Create order error:", error, data);
        toast.error("Failed to initiate payment. Please try again.");
        setIsSubmitting(false);
        return;
      }

      console.log("Order created:", data);

      // Open Razorpay checkout
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: "INR",
        name: "Bhakti Jamming Crew",
        description: "Registration for 11 Jan Event",
        order_id: data.orderId,
        prefill: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          contact: phone.trim(),
        },
        handler: async (response: any) => {
          console.log("Payment successful:", response);
          const verifyToast = toast.loading("Verifying payment...");
          
          try {
            // Verify payment
            const { data: verifyData, error: verifyError } = await supabase.functions.invoke("verify-razorpay-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                eventId: EVENT_ID,
              },
            });

            console.log("Verification response:", verifyData, verifyError);

            if (verifyError || !verifyData?.success) {
              toast.dismiss(verifyToast);
              toast.error("Payment verification failed. Contact support with ID: " + response.razorpay_payment_id);
              setIsSubmitting(false);
              return;
            }

            // Save registration to temp_event_registrations
            const bookingCode = await saveRegistration(response.razorpay_payment_id);
            
            toast.dismiss(verifyToast);
            toast.success("Payment successful! You're registered.");
            
            setRegistrationData({
              bookingCode,
              name: name.trim(),
              paymentId: response.razorpay_payment_id,
            });
          } catch (err) {
            console.error("Post-payment error:", err);
            toast.dismiss(verifyToast);
            toast.error("Registration saved but there was an issue. Contact support with ID: " + response.razorpay_payment_id);
          }
          setIsSubmitting(false);
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setIsSubmitting(false);
          },
          escape: true,
          animation: true,
        },
        theme: {
          color: "#E07B39",
        },
        retry: {
          enabled: true,
          max_count: 3,
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error);
        toast.error(`Payment failed: ${response.error?.description || "Please try again"}`);
        setIsSubmitting(false);
      });
      razorpay.open();
    } catch (err) {
      console.error("Payment initiation error:", err);
      toast.error("Failed to initiate payment. Please try again.");
      setIsSubmitting(false);
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
                Payment Successful!
              </h2>
              <p className="text-muted-foreground mb-2">
                Thank you for registering, <span className="font-semibold text-foreground">{registrationData.name}</span>!
              </p>
              {registrationData.paymentId && (
                <p className="text-xs text-muted-foreground mb-6">
                  Payment ID: {registrationData.paymentId}
                </p>
              )}
              
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
                  <span>11th January 2026</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Agra</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <IndianRupee className="w-4 h-4 text-primary" />
                  <span>₹{EVENT_PRICE} Paid</span>
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
              11 Jan Event Registration
            </h2>
            <div className="flex items-center justify-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>Agra</span>
              </div>
              <div className="flex items-center gap-1">
                <IndianRupee className="w-4 h-4" />
                <span className="font-semibold text-primary">₹{EVENT_PRICE}</span>
              </div>
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

              {!user && (
                <p className="text-sm text-muted-foreground text-center">
                  You'll need to <a href="/auth" className="text-primary underline">sign in</a> to complete payment
                </p>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !razorpayLoaded}
                className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  "Processing..."
                ) : (
                  <>
                    <IndianRupee className="w-4 h-4" />
                    Register & Pay ₹{EVENT_PRICE}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TempEventRegistration;
