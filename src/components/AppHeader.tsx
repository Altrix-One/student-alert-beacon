import { Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  onOpenSettings: () => void;
}

export const AppHeader = ({ onOpenSettings }: AppHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-6 bg-gradient-card border-b border-border/50 shadow-card backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="h-12 w-12 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-floating animate-glow-pulse">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground tracking-tight">SafeCampus</h1>
          <p className="text-sm text-muted-foreground font-medium">University Emergency App</p>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSettings}
        className="hover:bg-primary/10 hover:scale-110 transition-all duration-300 rounded-xl"
      >
        <Settings className="h-6 w-6 text-muted-foreground" />
      </Button>
    </header>
  );
};