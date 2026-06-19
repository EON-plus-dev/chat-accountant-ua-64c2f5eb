import { useMemo } from "react";
import { ConsultationChat } from "./ConsultationChat";
import { ConsultationLibrary } from "./ConsultationLibrary";
import { JsonLd } from "@/components/seo/JsonLd";
import { mockConsultations } from "@/config/consultationMockData";
import { BASE_URL } from "@/components/seo/SeoHead";

export const AIConsultantSection = () => {
  const faqSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: mockConsultations.map((c) => ({
      "@type": "Question",
      name: c.question,
      dateCreated: c.date,
      ...(c.updatedDate && { dateModified: c.updatedDate }),
      acceptedAnswer: {
        "@type": "Answer",
        text: c.answer.split("\n\n")[0],
        dateCreated: c.date,
        ...(c.updatedDate && { dateModified: c.updatedDate }),
      },
    })),
  }), []);

  const webPageSchema = useMemo(() => ({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "AI-Консультант — FINTODO",
    description: "Безкоштовні AI-консультації з бухгалтерії та податків для ФОП та фізосіб в Україні.",
    url: `${BASE_URL}/#ai-consultant`,
    publisher: {
      "@type": "Organization",
      name: "FINTODO",
      url: BASE_URL,
    },
  }), []);

  return (
    <section id="ai-consultant" className="py-12 sm:py-16">
      <JsonLd data={faqSchema} />
      <JsonLd data={webPageSchema} />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">AI-Консультант</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
          Задайте питання — отримайте відповідь за секунди. Найкращі консультації публікуються{" "}
          <button
            onClick={() => document.getElementById("consultation-library")?.scrollIntoView({ behavior: "smooth" })}
            className="text-primary hover:underline font-medium"
          >
            в бібліотеці
          </button>
          .
          </p>
        </div>

        <ConsultationChat />
        <ConsultationLibrary />
      </div>
    </section>
  );
};
