import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Search, 
  CheckCircle, 
  XCircle, 
  User, 
  Phone, 
  Mail,
  Clock,
  QrCode
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Registration {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  booking_code: string;
  checked_in: boolean;
  checked_in_at: string | null;
  created_at: string;
}

const CheckIn = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [searchCode, setSearchCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [foundRegistration, setFoundRegistration] = useState<Registration | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setCheckingAdmin(false);
        return;
      }

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!error && data) {
        setIsAdmin(true);
      }
      setCheckingAdmin(false);
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      toast.error("Please enter a booking code");
      return;
    }

    setIsSearching(true);
    setFoundRegistration(null);

    // Clean up the search code (remove BJC: prefix if scanned)
    let cleanCode = searchCode.trim().toUpperCase();
    if (cleanCode.startsWith("BJC:")) {
      cleanCode = cleanCode.substring(4);
    }

    const { data, error } = await supabase
      .from("temp_event_registrations")
      .select("*")
      .eq("booking_code", cleanCode)
      .maybeSingle();

    setIsSearching(false);

    if (error) {
      toast.error("Error searching for booking");
      console.error("Search error:", error);
      return;
    }

    if (!data) {
      toast.error("No booking found with this code");
      return;
    }

    setFoundRegistration(data as Registration);
  };

  const handleCheckIn = async () => {
    if (!foundRegistration) return;

    setIsCheckingIn(true);

    const { error } = await supabase
      .from("temp_event_registrations")
      .update({ 
        checked_in: true, 
        checked_in_at: new Date().toISOString() 
      })
      .eq("id", foundRegistration.id);

    setIsCheckingIn(false);

    if (error) {
      toast.error("Failed to check in. Please try again.");
      console.error("Check-in error:", error);
      return;
    }

    setFoundRegistration({
      ...foundRegistration,
      checked_in: true,
      checked_in_at: new Date().toISOString(),
    });
    toast.success(`${foundRegistration.name} has been checked in!`);
  };

  const handleUndoCheckIn = async () => {
    if (!foundRegistration) return;

    setIsCheckingIn(true);

    const { error } = await supabase
      .from("temp_event_registrations")
      .update({ 
        checked_in: false, 
        checked_in_at: null 
      })
      .eq("id", foundRegistration.id);

    setIsCheckingIn(false);

    if (error) {
      toast.error("Failed to undo check-in. Please try again.");
      console.error("Undo check-in error:", error);
      return;
    }

    setFoundRegistration({
      ...foundRegistration,
      checked_in: false,
      checked_in_at: null,
    });
    toast.success("Check-in has been undone");
  };

  const resetSearch = () => {
    setSearchCode("");
    setFoundRegistration(null);
  };

  if (authLoading || checkingAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-4">
            You don't have permission to access the check-in system.
          </p>
          <Link to="/" className="text-primary hover:underline">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin
        </Link>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display font-bold text-3xl text-secondary mb-2">
              Event Check-In
            </h1>
            <p className="text-muted-foreground">
              Enter or scan a booking code to check in attendees
            </p>
          </div>

          {/* Search Section */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-lg mb-6">
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Enter booking code (e.g., ABC123)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="font-mono text-lg tracking-wider"
              />
              <Button 
                onClick={handleSearch} 
                disabled={isSearching}
                className="shrink-0"
              >
                {isSearching ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Result Section */}
          {foundRegistration && (
            <div className="bg-card rounded-2xl border border-border p-6 shadow-lg animate-in fade-in slide-in-from-bottom-4">
              {/* Status Banner */}
              <div className={`rounded-lg p-4 mb-6 ${
                foundRegistration.checked_in 
                  ? "bg-green-500/10 border border-green-500/20" 
                  : "bg-yellow-500/10 border border-yellow-500/20"
              }`}>
                <div className="flex items-center gap-3">
                  {foundRegistration.checked_in ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Clock className="w-6 h-6 text-yellow-500" />
                  )}
                  <div>
                    <p className={`font-semibold ${
                      foundRegistration.checked_in ? "text-green-600" : "text-yellow-600"
                    }`}>
                      {foundRegistration.checked_in ? "Already Checked In" : "Not Checked In Yet"}
                    </p>
                    {foundRegistration.checked_in && foundRegistration.checked_in_at && (
                      <p className="text-sm text-muted-foreground">
                        {new Date(foundRegistration.checked_in_at).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Code */}
              <div className="bg-primary/10 rounded-lg p-4 text-center mb-6">
                <p className="text-xs text-muted-foreground mb-1">Booking Code</p>
                <p className="font-mono text-3xl font-bold text-primary tracking-wider">
                  {foundRegistration.booking_code}
                </p>
              </div>

              {/* User Details */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-medium">{foundRegistration.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium">{foundRegistration.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium">{foundRegistration.email}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!foundRegistration.checked_in ? (
                  <Button 
                    onClick={handleCheckIn} 
                    disabled={isCheckingIn}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isCheckingIn ? "Checking In..." : "Check In"}
                  </Button>
                ) : (
                  <Button 
                    onClick={handleUndoCheckIn} 
                    disabled={isCheckingIn}
                    variant="outline"
                    className="flex-1"
                  >
                    {isCheckingIn ? "Processing..." : "Undo Check-In"}
                  </Button>
                )}
                <Button variant="outline" onClick={resetSearch}>
                  New Search
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckIn;
