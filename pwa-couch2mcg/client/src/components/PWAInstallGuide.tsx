import { useState } from 'react';
import { ChevronDown, Smartphone, Share2, Plus } from 'lucide-react';

export const PWAInstallGuide = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-blue-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <Smartphone className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Install App on Your Phone</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 py-4 bg-white border-t border-blue-200 space-y-4">
          <div className="space-y-3">
            {/* iOS Instructions */}
            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="text-lg">🍎</span> iPhone / iPad
              </h4>
              <ol className="space-y-2 text-sm text-muted-foreground ml-6">
                <li className="flex gap-2">
                  <span className="font-bold text-primary min-w-fit">1.</span>
                  <span>Tap the <strong>Share</strong> button (arrow pointing up)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary min-w-fit">2.</span>
                  <span>Scroll down and tap <strong>"Add to Home Screen"</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary min-w-fit">3.</span>
                  <span>Tap <strong>"Add"</strong> in the top right</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary min-w-fit">4.</span>
                  <span>The app will now appear on your home screen!</span>
                </li>
              </ol>
            </div>

            {/* Android Instructions */}
            <div>
              <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                <span className="text-lg">🤖</span> Android
              </h4>
              <ol className="space-y-2 text-sm text-muted-foreground ml-6">
                <li className="flex gap-2">
                  <span className="font-bold text-primary min-w-fit">1.</span>
                  <span>Tap the <strong>Menu</strong> button (three dots)</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary min-w-fit">2.</span>
                  <span>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong></span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary min-w-fit">3.</span>
                  <span>Confirm the installation</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold text-primary min-w-fit">4.</span>
                  <span>The app will now appear on your home screen!</span>
                </li>
              </ol>
            </div>

            {/* Benefits */}
            <div className="bg-primary/5 rounded p-3 mt-4">
              <h4 className="font-semibold text-foreground text-sm mb-2">Benefits of Installing:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>✓ Works offline - train anywhere, anytime</li>
                <li>✓ Fast loading - no waiting for web pages</li>
                <li>✓ Full screen experience - no browser bars</li>
                <li>✓ Push notifications - get reminders for workouts</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
