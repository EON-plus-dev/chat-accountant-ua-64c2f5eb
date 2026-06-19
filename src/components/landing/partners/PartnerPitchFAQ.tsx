import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faq = [
  {
    q: "А якщо клієнт «обріже» мене і працюватиме з FINTODO напряму?",
    a: "Reseller-знижка прив'язана до партнерського зв'язку. Без вас клієнт втрачає −25/30/35% — економічно невигідно йти напряму. Плюс ми ніколи не пропонуємо клієнту «прибрати бухгалтера»: це порушення умов партнерства й автоматичне обмеження для нашої команди.",
  },
  {
    q: "Скільки коштує стати партнером?",
    a: "Сертифікація — безкоштовна (онлайн-курс + тест, 1–2 дні). Далі ви обираєте партнерський тариф: Solo (499 ₴/міс), Agency (1 499 ₴/міс) або Firm (3 499 ₴/міс). Це ваш робочий інструмент і одночасно ключ до Reseller-знижки клієнтам.",
  },
  {
    q: "Як отримую вигоду — знижкою клієнту чи грошима собі?",
    a: "Ви обираєте режим у партнерському кабінеті: «to_client» — знижка йде клієнту і допомагає вам утримати/закрити угоду; «revenue_share» — знижка зараховується вам як грошова виплата. Можна перемикати по кожному клієнту окремо.",
  },
  {
    q: "Чи беруть з мене комісію з гонорару клієнта?",
    a: "Ні, 0%. Назавжди. Ваші гонорари — повністю ваші. Ми заробляємо виключно на підписці клієнта на FINTODO.",
  },
  {
    q: "Як швидко окупиться партнерська підписка?",
    a: "Median окупність по 320 партнерах — 2,1 місяця. Уже на 3–5 клієнтах одна тільки Reseller-економія перекриває вартість Solo-підписки.",
  },
  {
    q: "Що з податками на додаткову виручку?",
    a: "Грошові виплати по revenue share — це послуги для FINTODO, ви виставляєте акт як ФОП. Вони оподатковуються за вашою стандартною групою (3 група ЄП — 5%). Знижка клієнту податків для вас не створює.",
  },
];

export const PartnerPitchFAQ = () => (
  <section id="faq" className="py-12 md:py-16 bg-muted/30 border-t border-border/40 scroll-mt-32">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-6 md:mb-10">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Питання про економіку партнерства
        </h2>
        <p className="text-muted-foreground">Прозорі відповіді на головне про гроші, ризики й виплати.</p>
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {faq.map((item, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="border border-border bg-card rounded-lg px-4"
          >
            <AccordionTrigger className="text-left text-sm md:text-base font-medium hover:no-underline">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground">{item.a}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  </section>
);
