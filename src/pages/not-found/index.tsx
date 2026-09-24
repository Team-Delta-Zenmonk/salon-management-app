import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scissors, ArrowLeft, Home, Calendar, Sparkles, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 sm:p-6 antialiased font-sans">
      <div className="w-full max-w-lg text-center space-y-6">
        {/* Salon Management Branding */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-sm">
            <Scissors className="text-primary-foreground w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground font-sans">
            Salon Management
          </span>
        </div>

        {/* 404 Main Card */}
        <div className="rounded-2xl border border-border bg-card p-8 shadow-sm relative overflow-hidden">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary mb-6 shadow-xs">
            <SearchX className="h-10 w-10" />
          </div>

          <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-bold font-mono text-primary border border-primary/20 mb-3">
            404 PAGE NOT FOUND
          </span>

          <h1 className="text-3xl font-extrabold tracking-tight text-foreground mb-2">
            Oops! Route Not Found
          </h1>

          <p className="text-sm text-muted-foreground leading-relaxed mb-6">
            The salon page, module, or resource you were looking for doesn't exist or may have been relocated.
          </p>

          <div className="bg-muted/70 border border-border rounded-xl p-4 mb-6 text-left text-xs text-muted-foreground space-y-2">
            <p className="font-semibold text-foreground">Suggested navigation:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border text-foreground hover:bg-accent transition-colors"
              >
                <Home className="h-4 w-4 text-primary" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/bookings"
                className="flex items-center gap-2 p-2 rounded-lg bg-card border border-border text-foreground hover:bg-accent transition-colors"
              >
                <Calendar className="h-4 w-4 text-primary" />
                <span>Bookings</span>
              </Link>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={handleGoBack}
              className="w-full sm:w-auto gap-2 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>

            <Link to="/dashboard" className="w-full sm:w-auto">
              <Button className="w-full gap-2 font-semibold cursor-pointer">
                <Home className="h-4 w-4" />
                Return to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          Need help? Navigate back using the sidebar or check your salon account status.
        </p>
      </div>
    </div>
  );
};

export default NotFoundPage;
