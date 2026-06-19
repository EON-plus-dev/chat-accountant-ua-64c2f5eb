import { Link } from "react-router-dom";

export const OsFooter = () => (
  <footer className="mt-24 border-t border-border/40 bg-muted/20">
    <div className="max-w-6xl mx-auto px-4 py-12 grid md:grid-cols-4 gap-8 text-sm">
      <div>
        <div className="font-semibold mb-2">FINTODO OS</div>
        <p className="text-muted-foreground leading-relaxed">
          Операційна система життя та бізнесу. Один кабінет, один AI, усі справи.
        </p>
      </div>
      <div>
        <div className="font-semibold mb-2">Продукт</div>
        <ul className="space-y-1.5 text-muted-foreground">
          <li><Link to="/os/modules" className="hover:text-foreground">Модулі</Link></li>
          <li><Link to="/os/scenarios" className="hover:text-foreground">Сценарії</Link></li>
          <li><Link to="/os/pricing" className="hover:text-foreground">Тарифи</Link></li>
          <li><Link to="/os/security" className="hover:text-foreground">Безпека</Link></li>
        </ul>
      </div>
      <div>
        <div className="font-semibold mb-2">Для кого</div>
        <ul className="space-y-1.5 text-muted-foreground">
          <li><Link to="/os?audience=business" className="hover:text-foreground">Для бізнесу</Link></li>
          <li><Link to="/os?audience=individual" className="hover:text-foreground">Для фізосіб</Link></li>
          <li><Link to="/partners" className="hover:text-foreground">Партнерам</Link></li>
        </ul>
      </div>
      <div>
        <div className="font-semibold mb-2">Інше</div>
        <ul className="space-y-1.5 text-muted-foreground">
          <li><Link to="/overview" className="hover:text-foreground">Портал знань</Link></li>
          <li><Link to="/dashboard" className="hover:text-foreground">Кабінет</Link></li>
          <li><a href="mailto:hello@fintodo.com.ua" className="hover:text-foreground">hello@fintodo.com.ua</a></li>
        </ul>
      </div>
    </div>
    <div className="border-t border-border/40 py-4 text-center text-xs text-muted-foreground">
      © {new Date().getFullYear()} FINTODO. Усі права захищені.
    </div>
  </footer>
);
