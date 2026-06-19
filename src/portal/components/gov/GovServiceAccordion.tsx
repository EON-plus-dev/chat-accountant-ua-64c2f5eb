import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Globe, AlertTriangle, Lightbulb, ExternalLink } from 'lucide-react';
import type { GovService, GovServiceDoc } from '@/portal/hooks/useGovBranches';

interface Props {
  services: (GovService & { gov_service_docs: GovServiceDoc[] })[];
}

const AUDIENCE_LABELS = {
  business: '💼 Бізнес',
  personal: '👤 Фізособам',
  both: '👥 Для всіх',
};

export function GovServiceAccordion({ services }: Props) {
  if (services.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-foreground">Послуги ({services.length})</h3>
      <Accordion type="multiple" className="space-y-1">
        {services.map((service) => (
          <AccordionItem key={service.id} value={service.id} className="border rounded-lg px-3">
            <AccordionTrigger className="py-3 text-sm hover:no-underline">
              <div className="flex items-center gap-2 text-left">
                <span>{service.name}</span>
                {service.is_online_available && (
                  <Badge variant="secondary" size="sm" className="shrink-0">🌐 Онлайн</Badge>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4 space-y-3">
              {service.description && (
                <p className="text-xs text-muted-foreground">{service.description}</p>
              )}

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" size="sm">
                  {AUDIENCE_LABELS[service.audience]}
                </Badge>
                {service.price && (
                  <Badge variant="outline" size="sm">💰 {service.price}</Badge>
                )}
                {service.processing_time && (
                  <Badge variant="outline" size="sm">
                    <Clock className="w-3 h-3 mr-1" /> {service.processing_time}
                  </Badge>
                )}
              </div>

              {service.price_note && (
                <p className="text-xs text-muted-foreground italic">💡 {service.price_note}</p>
              )}

              {service.online_url && (
                <a
                  href={service.online_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Globe className="w-3 h-3" /> Оформити онлайн <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {service.legal_basis && (
                <p className="text-xs text-muted-foreground">📜 {service.legal_basis}</p>
              )}

              {/* Required docs */}
              {service.gov_service_docs.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Документи
                  </p>
                  <ul className="space-y-1">
                    {service.gov_service_docs
                      .sort((a, b) => a.sort_order - b.sort_order)
                      .map((doc) => (
                        <li key={doc.id} className="text-xs flex items-start gap-1.5">
                          <span className={doc.is_required ? 'text-destructive' : 'text-muted-foreground'}>
                            {doc.is_required ? '●' : '○'}
                          </span>
                          <div>
                            <span className="text-foreground">{doc.document_name}</span>
                            {doc.how_to_get && (
                              <span className="text-muted-foreground"> — {doc.how_to_get}</span>
                            )}
                            {doc.template_url && (
                              <a
                                href={doc.template_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline ml-1"
                              >
                                [шаблон]
                              </a>
                            )}
                            {doc.note && (
                              <p className="text-muted-foreground italic mt-0.5">{doc.note}</p>
                            )}
                          </div>
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {service.requirements && service.requirements.length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground">📋 Вимоги</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {service.requirements.map((r, i) => (
                      <li key={i} className="text-xs text-muted-foreground">{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Common mistakes */}
              {service.common_mistakes && service.common_mistakes.length > 0 && (
                <div className="space-y-1 bg-destructive/5 rounded-md p-2">
                  <p className="text-xs font-semibold text-destructive flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Часті помилки
                  </p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {service.common_mistakes.map((m, i) => (
                      <li key={i} className="text-xs text-destructive/80">{m}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tips */}
              {service.tips && service.tips.length > 0 && (
                <div className="space-y-1 bg-primary/5 rounded-md p-2">
                  <p className="text-xs font-semibold text-primary flex items-center gap-1">
                    <Lightbulb className="w-3.5 h-3.5" /> Поради
                  </p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {service.tips.map((t, i) => (
                      <li key={i} className="text-xs text-primary/80">{t}</li>
                    ))}
                  </ul>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
