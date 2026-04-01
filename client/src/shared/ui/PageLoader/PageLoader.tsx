import { Loader2 } from "lucide-react";

export const PageLoader = () => (
  <div className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center">
    <Loader2 className="h-10 w-10 animate-spin text-blue-500 opacity-50" />
  </div>
);
