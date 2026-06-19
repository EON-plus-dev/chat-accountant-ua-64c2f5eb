/**
 * NOMENCLATURE ORIGIN CARD
 * 
 * Інформація про походження товару:
 * - Країна виробництва (з прапором)
 * - Виробник
 * - Сертифікати
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Globe, Factory, Award, ShieldCheck } from "lucide-react";
import type { NomenclatureItemV2 } from "@/config/nomenclatureConfig";

interface NomenclatureOriginCardProps {
  item: NomenclatureItemV2;
}

// Country flag emoji mapping
const countryFlags: Record<string, { flag: string; name: string }> = {
  UA: { flag: "🇺🇦", name: "Україна" },
  DE: { flag: "🇩🇪", name: "Німеччина" },
  PL: { flag: "🇵🇱", name: "Польща" },
  CN: { flag: "🇨🇳", name: "Китай" },
  US: { flag: "🇺🇸", name: "США" },
  IT: { flag: "🇮🇹", name: "Італія" },
  FR: { flag: "🇫🇷", name: "Франція" },
  JP: { flag: "🇯🇵", name: "Японія" },
  KR: { flag: "🇰🇷", name: "Південна Корея" },
  TR: { flag: "🇹🇷", name: "Туреччина" },
};

// Mock origin data based on item
const getOriginData = (item: NomenclatureItemV2) => {
  const countryCode = item.id.charCodeAt(0) % 2 === 0 ? "DE" : "UA";
  const countryInfo = countryFlags[countryCode] || { flag: "🌍", name: "Невідомо" };
  
  const manufacturers: Record<string, string> = {
    DE: "TechCorp GmbH",
    UA: "ТОВ \"Укрприлад\"",
  };
  
  const certificates = item.category === "product" 
    ? ["CE", "ISO 9001", "ДСТУ"] 
    : ["ISO 9001"];
  
  return {
    countryCode,
    countryFlag: countryInfo.flag,
    countryName: countryInfo.name,
    manufacturer: manufacturers[countryCode] || "Невідомий виробник",
    certificates,
  };
};

export const NomenclatureOriginCard = ({ item }: NomenclatureOriginCardProps) => {
  const origin = getOriginData(item);

  return (
    <Card>
      <CardHeader className="py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Globe className="h-4 w-4" />
          Походження
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {/* Country */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Країна виробництва
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl">{origin.countryFlag}</span>
            <span className="text-sm font-medium">{origin.countryName}</span>
          </div>
        </div>
        
        <Separator />
        
        {/* Manufacturer */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Factory className="h-4 w-4" />
            Виробник
          </span>
          <span className="text-sm font-medium">{origin.manufacturer}</span>
        </div>
        
        <Separator />
        
        {/* Certificates */}
        <div className="flex items-start justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            Сертифікати
          </span>
          <div className="flex flex-wrap gap-1.5 justify-end">
            {origin.certificates.map((cert) => (
              <Badge 
                key={cert} 
                variant="outline" 
                className="text-xs gap-1 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800"
              >
                <Award className="h-3 w-3 text-emerald-600" />
                {cert}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
