import { Scissors } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  const handleGoBack = () => {
    globalThis.history.back();
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center rounded-xl border border-border p-6 shadow-sm bg-card">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center">
            <Scissors className="text-primary-foreground w-12 h-12" />
          </div>
        </div>

        <div className="mb-4">
          <h1 className="text-6xl font-bold text-foreground">403</h1>
        </div>
        <h2 className="text-2xl font-semibold text-foreground mb-3">Access Denied</h2>
        <div className="text-muted-foreground mb-8">
          You don't have permission to access this page. This area is restricted to authorized users only.
        </div>
        
        <div className="bg-muted border border-border rounded-lg p-4 mb-8 text-left">
          <h3 className="text-foreground font-medium mb-2">This might have happened because:</h3>
          <ul className="text-muted-foreground space-y-1 ml-4 list-disc list-inside">
            <li>You don't have the required permissions</li>
            <li>Your session has expired</li>
            <li>This feature is restricted to administrators</li>
            <li>Your account hasn't been fully activated</li>
          </ul>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={handleGoBack}
            className="px-8"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
