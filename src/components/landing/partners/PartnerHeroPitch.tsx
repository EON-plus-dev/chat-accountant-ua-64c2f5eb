import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";

export const PartnerHeroPitch = () => (
  <section className="relative py-12 md:py-20 bg-gradient-to-br from-primary/10 via-background to-background border-b border-border/40">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl"
      >
        <Badge variant="outline" className="gap-1 mb-4">
          <Sparkles className="h-3 w-3" /> Партнерська програма FINTODO
        </Badge>
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          Ведіть удвічі більше ФОП —{" "}
          <span className="text-primary">без найму і переробок.</span>
        </h1>
        <p className="text-base md:text-lg text-muted-foreground mb-6">
          Автоматизація рутини звільняє 60% часу на клієнта. Той самий бухгалтер веде 12 → 25 ФОП.
          Плюс знижка для клієнтів і 0% комісії з вашого гонорару.
        </p>

        <div className="flex flex-col sm:flex-row sm:items-end gap-4 mb-2">
          <div>
            <div className="text-[11px] uppercase tracking-wide text-muted-foreground mb-1">
              Типове бюро на 15 ФОП за рік
            </div>
            <div className="text-4xl md:text-5xl font-bold text-primary leading-none">
              +211 000 ₴
            </div>
          </div>
          <div className="flex gap-4 text-sm sm:pb-1">
            <div>
              <span className="font-bold text-foreground">~1 міс</span>
              <span className="text-muted-foreground"> окупність</span>
            </div>
            <div>
              <span className="font-bold text-foreground">−60%</span>
              <span className="text-muted-foreground"> рутини</span>
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground mb-6">
          = +4 нові клієнти × 3 500 ₴ + Reseller-виплата 30%. Свій розрахунок ↓
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="gap-1">
            <a href="#calculator">
              Розрахувати мою вигоду <ArrowRight className="h-4 w-4" />
            </a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/learn/certification">Стати партнером</Link>
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
          <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          320+ сертифікованих бухгалтерів · окупність ~2 місяці
        </div>
      </motion.div>
    </div>
  </section>
);
