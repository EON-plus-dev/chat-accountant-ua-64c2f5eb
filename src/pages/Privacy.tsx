import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SeoHead, BASE_URL } from "@/components/seo/SeoHead";

const Privacy = () => (
  <div className="min-h-screen bg-background">
    <SeoHead
      title="Політика конфіденційності | FINTODO"
      description="Політика конфіденційності сервісу FINTODO. Інформація про обробку та захист персональних даних користувачів."
      canonical={`${BASE_URL}/privacy`}
    />
    <div className="max-w-3xl mx-auto px-4 py-10 sm:py-16 space-y-6 sm:space-y-8">
      <Link to="/">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          На головну
        </Button>
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold">Політика конфіденційності</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>Ця сторінка знаходиться в розробці. Повний текст політики конфіденційності буде опублікований найближчим часом.</p>
        <p>Якщо у вас є запитання щодо обробки персональних даних, зверніться на <a href="mailto:support@ai-accountant.ua" className="text-primary hover:underline">support@ai-accountant.ua</a>.</p>
      </div>
    </div>
  </div>
);

export default Privacy;
