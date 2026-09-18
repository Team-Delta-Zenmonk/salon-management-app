import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  CalendarCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { callSnack } from "@/components/snackbar";
import { getCanonicalStorefrontUrl, getStorefrontUrl } from "@/lib/domain";

interface OnboardingSuccessDialogProps {
  open: boolean;
  slug: string;
  onClose?: () => void;
}

export default function OnboardingSuccessDialog({
  open,
  slug,
  onClose,
}: OnboardingSuccessDialogProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const canonicalUrl = getCanonicalStorefrontUrl(slug);
  const previewUrl = getStorefrontUrl(slug);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(canonicalUrl);
      setCopied(true);
      callSnack("Storefront URL copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      callSnack("Failed to copy link", "error");
    }
  };

  const handleNavigateBilling = () => {
    if (onClose) onClose();
    navigate("/billing");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => !isOpen && handleNavigateBilling()}
    >
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-md p-6 overflow-hidden rounded-2xl border border-primary/20 shadow-2xl bg-card"
      >
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <Sparkles className="w-8 h-8 animate-pulse text-primary" />
          </div>

          <DialogHeader className="space-y-1.5 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mx-auto">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>7-Day Free Trial Activated</span>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
              Your Salon is Officially Live!
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground max-w-sm mx-auto">
              Your dynamic booking portal is online and ready for clients to
              discover services and reserve appointments.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 rounded-xl bg-muted/60 border border-border/80 space-y-3 text-left">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
              <span>Your Public Storefront URL:</span>
              <span className="text-[11px] text-primary font-semibold">
                Live & Active
              </span>
            </div>

            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-background border border-border">
              <span className="flex-1 font-mono text-xs font-semibold text-foreground truncate select-all">
                {canonicalUrl}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-7 px-2.5 text-xs gap-1.5 text-muted-foreground hover:text-foreground shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500 font-semibold">
                      Copied
                    </span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center justify-between pt-1">
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Visit Storefront in New Tab</span>
              </a>
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <CalendarCheck className="w-3 h-3 text-muted-foreground" />
                Trial ends in 7 days
              </span>
            </div>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <Button
              size="lg"
              onClick={handleNavigateBilling}
              className="w-full gap-2 font-semibold shadow-md shadow-primary/20"
            >
              <span>Continue to Billing</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
