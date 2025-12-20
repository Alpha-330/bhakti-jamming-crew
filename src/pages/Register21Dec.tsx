import TempEventRegistration from "@/components/TempEventRegistration";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Register21Dec = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
      <TempEventRegistration />
    </div>
  );
};

export default Register21Dec;
