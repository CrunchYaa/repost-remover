import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Cookie, X } from "lucide-react";

const STORAGE_KEY = "arc_cookie_consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(STORAGE_KEY, "true");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="glass-card border border-violet-500/30 rounded-2xl p-8 max-w-md w-full shadow-[0_0_60px_rgba(124,58,237,0.2)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-violet-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">Cookie & Privacy Policy</h2>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                We use essential cookies to keep your session secure and your device verified. No tracking or advertising cookies are used.
              </p>

              <div className="bg-violet-950/30 border border-violet-500/20 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-2">
                  <Shield className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-violet-300 leading-relaxed">
                    By continuing, you agree to our{" "}
                    <span className="text-violet-200 font-medium">Terms of Service</span> and acknowledge that this tool is intended for managing your own TikTok reposts only. Misuse is strictly prohibited.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={accept}
                  className="flex-1 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]"
                >
                  Accept & Continue
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
