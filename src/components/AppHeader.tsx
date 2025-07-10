import { Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppHeaderProps {
  onOpenSettings: () => void;
}

export const AppHeader = ({ onOpenSettings }: AppHeaderProps) => {
  return (
    <header className="flex items-center justify-between p-4 bg-gradient-hero border-b border-border/50">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 bg-gradient-primary rounded-full flex items-center justify-center shadow-glow">
          <Shield className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">SafeCampus</h1>
          <p className="text-xs text-muted-foreground">University Emergency App</p>
        </div>
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onOpenSettings}
        className="hover:bg-white/10"
      >
        <Settings className="h-5 w-5" />
      </Button>
    </header>
  );
};