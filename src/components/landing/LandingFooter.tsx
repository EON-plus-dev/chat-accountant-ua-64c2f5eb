import { Calculator, Mail, Phone, Send, Share2 } from "lucide-react";
import { Link } from "react-router-dom";
import { navLinks } from "@/config/landingData";

const scrollTo = (href: string) => {
  const id = href.replace("#", "");
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const productLinks = navLinks.flatMap((l) =>
  l.children ? l.children.map((c) => ({ label: c.label, href: c.href })) : [{ label: l.label, href: l.href }]
);

export const LandingFooter = () => (
  <footer className="border-t border-border/50 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
        {/* Logo column */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 font-bold">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Calculator className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-sans font-semibold tracking-wide">FINTODO</span>
          </div>
          <p className="text-sm text-muted-foreground">
            AI-платформа для бухгалтерії та податків в Україні.
          </p>
        </div>

        {/* Product links — 2 mini-columns */}
        <div>
          <h4 className="font-semibold text-sm mb-3">Продукт</h4>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
            {productLinks.map((link) => (
              <li key={link.label}>
                {link.href.startsWith("/") ? (
                  <Link to={link.href} className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors">
                    {link.label}
                  </Link>
                ) : (
                  <button
                    onClick={() => scrollTo(link.href)}
                    className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors"
                  >
                    {link.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Contacts */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm mb-3">Контакти</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            <Mail className="w-4 h-4 shrink-0" />
            <a href="mailto:support@fintodo.ua" className="hover:text-foreground hover:underline transition-colors truncate min-w-0">support@fintodo.ua</a>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
            <Phone className="w-4 h-4 shrink-0" />
            <a href="tel:+380441234567" className="hover:text-foreground hover:underline transition-colors truncate min-w-0 whitespace-nowrap">+38 (044) 123-45-67</a>
          </div>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <a href="https://t.me/fintodo_ua" target="_blank" rel="noopener noreferrer" aria-label="Telegram" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
              <Send className="w-4 h-4" aria-hidden="true" />
            </a>
            <a href="https://linkedin.com/company/fintodo" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
              <Share2 className="w-4 h-4" aria-hidden="true" />
            </a>
            <a href="https://facebook.com/fintodo.ua" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
              <Share2 className="w-4 h-4" aria-hidden="true" />
            </a>
            <a href="https://instagram.com/fintodo.ua" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
              <Share2 className="w-4 h-4" aria-hidden="true" />
            </a>
            <a href="https://youtube.com/@fintodo" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
              <Share2 className="w-4 h-4" aria-hidden="true" />
            </a>
            <a href="https://x.com/fintodo_ua" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
              <Share2 className="w-4 h-4" aria-hidden="true" />
            </a>
            <a href="https://tiktok.com/@fintodo.ua" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 4.76 1.52V6.84a4.84 4.84 0 0 1-1-.15z"/></svg>
            </a>
            <a href="https://threads.net/@fintodo.ua" target="_blank" rel="noopener noreferrer" aria-label="Threads" className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.186 24h-.007C5.461 23.956.057 18.509 0 11.747.057 5.488 5.461.044 12.179 0h.007C18.896.044 24.3 5.488 24.357 11.747 24.3 18.509 18.896 23.956 12.186 24zm.08-21.348c-4.643.038-8.412 3.845-8.45 8.535.038 4.687 3.807 8.494 8.45 8.532 4.644-.038 8.413-3.845 8.451-8.532-.038-4.69-3.807-8.497-8.45-8.535zm3.231 12.26c-.384 1.086-1.48 1.834-2.756 1.957a4.726 4.726 0 0 1-.555.033c-1.253 0-2.31-.462-3.06-1.337-.658-.77-.998-1.79-1.012-3.033l2.005.008c.012.753.208 1.36.583 1.8.404.473.99.733 1.696.733h.002c.093 0 .185-.004.275-.013.726-.07 1.296-.437 1.482-.954.12-.337.073-.696-.134-.977-.31-.42-1.013-.667-1.87-.88l-.124-.03c-1.797-.433-3.045-.95-3.712-1.533-.744-.652-1.1-1.538-1.058-2.634.065-1.694 1.092-3.082 2.68-3.623a4.397 4.397 0 0 1 1.42-.237c1.832 0 3.33 1.088 3.908 2.838l-1.89.67c-.34-.99-1.142-1.577-2.168-1.577-.294 0-.584.05-.862.15-.843.3-1.386.98-1.413 1.77-.018.516.162.93.536 1.232.488.396 1.395.73 2.696 1.044l.103.024c.94.22 1.997.505 2.735 1.085.597.47.956 1.1 1.068 1.873.073.502.023 1.012-.145 1.48z"/></svg>
            </a>
          </div>
        </div>

        {/* Legal */}
        <div>
          <h4 className="font-semibold text-sm mb-3">Юридичне</h4>
          <ul className="space-y-2">
            <li><Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors">Політика конфіденційності</Link></li>
            <li><Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors">Умови використання</Link></li>
            <li><Link to="/newsletter" className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors">Дайджест</Link></li>
            
            <li><Link to="/login" className="text-sm text-muted-foreground hover:text-foreground hover:underline transition-colors">Увійти</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/50 pt-6 text-center">
        <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} FINTODO. Усі права захищено.</span>
      </div>
    </div>
  </footer>
);
