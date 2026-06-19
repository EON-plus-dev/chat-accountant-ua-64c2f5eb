import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Receipt, TrendingUp, Building2, Users, ExternalLink, XCircle, CheckCircle } from "lucide-react";
import type { Cabinet } from "@/types/cabinet";
import { getEntityStyle } from "@/config/entityStyles";
import { cn } from "@/lib/utils";
import { fopIncomeLimits } from "@/config/incomeBookConfig";
import { ESV_MONTHLY, TAX_RATES, EP_FIXED, MINIMUM_WAGE } from "@/config/taxConstantsConfig";
import { RegistrySyncedField, RegistrySyncBanner } from "@/components/shared";

interface TaxProfileSectionProps {
  cabinet: Cabinet;
}

// Get tax rate info based on group and VAT status
const getTaxRateInfo = (group: 1 | 2 | 3, isVatPayer: boolean): { value: string; reference: string } => {
  switch (group) {
    case 1:
      return { 
        value: `${Math.round(TAX_RATES.epGroup1 * 100)}% від МЗП (${EP_FIXED.group1.toLocaleString('uk-UA')} ₴/міс)`, 
        reference: 'ст. 293.1 ПКУ' 
      };
    case 2:
      return { 
        value: `${Math.round(TAX_RATES.epGroup2 * 100)}% від МЗП (${EP_FIXED.group2.toLocaleString('uk-UA')} ₴/міс)`, 
        reference: 'ст. 293.2 ПКУ' 
      };
    case 3:
      return { 
        value: isVatPayer 
          ? `${Math.round(TAX_RATES.epGroup3_withVat * 100)}% від доходу (з ПДВ)` 
          : `${Math.round(TAX_RATES.epGroup3_withoutVat * 100)}% від доходу (без ПДВ)`, 
        reference: 'ст. 293.3 ПКУ' 
      };
  }
};

// Get ESV info
const getEsvInfo = (): { value: string; reference: string } => ({
  value: `${ESV_MONTHLY.toLocaleString('uk-UA')} ₴/міс`,
  reference: 'ст. 4 ЗУ «Про ЄСВ»'
});

export const TaxProfileSection = ({ cabinet }: TaxProfileSectionProps) => {
  // Get FOP limit data from cabinet using unified source
  const getFopLimitData = () => {
    if (cabinet.type !== "fop") return null;
    
    const group = cabinet.fopGroup || 3;
    const limit = fopIncomeLimits[group] || fopIncomeLimits[3];
    const yearlyIncome = cabinet.yearlyIncome || 0;
    const usedPercent = limit > 0 ? (yearlyIncome / limit) * 100 : 0;
    const remaining = limit - yearlyIncome;
    
    // Forecast calculation
    const currentMonth = new Date().getMonth() + 1;
    const monthlyAverage = currentMonth > 0 ? yearlyIncome / currentMonth : 0;
    const monthsUntilLimit = monthlyAverage > 0 ? Math.ceil(remaining / monthlyAverage) : null;
    
    return {
      group,
      limit,
      yearlyIncome,
      usedPercent,
      remaining,
      forecast: monthsUntilLimit,
    };
  };

  const fopLimit = getFopLimitData();
  const entityStyle = getEntityStyle(cabinet.type);
  
  // Registry sync status (simulated for demo)
  const isRegistryVerified = true; // In real app: cabinet.registrySync?.edr?.isVerified ?? false
  const isVatPayer = cabinet.registrySync?.vat?.isVatPayer ?? false;
  const lastSyncDate = cabinet.registrySync?.edr?.lastSync ?? new Date().toISOString();

  return (
    <div className="space-y-5">
      {/* FOP Tax Profile */}
      {cabinet.type === "fop" && (
        <>
          <Card className={cn("border-l-4 hover:shadow-md transition-all", entityStyle.borderColor)}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Receipt className={cn("h-5 w-5", entityStyle.color)} />
                <CardTitle className="text-base">Система оподаткування</CardTitle>
              </div>
              <CardDescription>Параметри єдиного податку</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {/* Registry sync banner */}
              {isRegistryVerified && (
                <RegistrySyncBanner 
                  sources={['edr', 'tax-cabinet']} 
                  lastSync={lastSyncDate}
                  changeAction={{
                    label: 'Змінити через Кабінет платника',
                    url: 'https://cabinet.tax.gov.ua/'
                  }}
                />
              )}
              
              {/* Registry-synced fields (read-only) */}
              <div className="grid gap-4 sm:grid-cols-2">
                <RegistrySyncedField
                  id="fopGroup"
                  label="Група ЄП"
                  value={`${fopLimit?.group || 3} група`}
                  source="tax-cabinet"
                  isVerified={isRegistryVerified}
                  lastSync={lastSyncDate}
                  required
                  helperText="Для зміни групи подайте заяву до ДПС"
                  helperLink={{ text: 'Подати заяву', url: 'https://cabinet.tax.gov.ua/' }}
                />
                
                <RegistrySyncedField
                  id="taxRate"
                  label="Ставка ЄП"
                  value={getTaxRateInfo(fopLimit?.group || 3, isVatPayer).value}
                  source="tax-cabinet"
                  isVerified={isRegistryVerified}
                  lastSync={lastSyncDate}
                  required
                  helperText={getTaxRateInfo(fopLimit?.group || 3, isVatPayer).reference}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <RegistrySyncedField
                  id="vatStatus"
                  label="Статус ПДВ"
                  value={
                    <span className="flex items-center gap-2">
                      {isVatPayer ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-success" />
                          Платник ПДВ
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                          Не платник ПДВ
                        </>
                      )}
                    </span>
                  }
                  source="vat-registry"
                  isVerified={isRegistryVerified}
                  lastSync={lastSyncDate}
                  helperText="Визначається реєстром платників ПДВ"
                />
                
                <RegistrySyncedField
                  id="esvMonthly"
                  label="ЄСВ щомісяця"
                  value={getEsvInfo().value}
                  source="pension-fund"
                  isVerified={isRegistryVerified}
                  lastSync={lastSyncDate}
                  helperText={`${getEsvInfo().reference} · мін. внесок від МЗП ${MINIMUM_WAGE.toLocaleString('uk-UA')} ₴`}
                />
              </div>

              {/* Editable settings */}
              <div className="pt-4 border-t">
                <p className="text-sm font-medium text-muted-foreground mb-4">Налаштування (редаговані)</p>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reportPeriod">Період звітування</Label>
                    <Select defaultValue="quarter">
                      <SelectTrigger id="reportPeriod">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quarter">Квартал</SelectItem>
                        <SelectItem value="year">Рік</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="esvMode">Режим ЄСВ</Label>
                    <Select defaultValue="minimum">
                      <SelectTrigger id="esvMode">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimum">Мінімальний внесок</SelectItem>
                        <SelectItem value="custom">Інший режим (демо)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limit Warning Settings (no visual progress, just settings) */}
          {fopLimit && (
            <Card className={cn("border-l-4 hover:shadow-md transition-all", entityStyle.borderColor)}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <TrendingUp className={cn("h-5 w-5", entityStyle.color)} />
                  <CardTitle className="text-base">Налаштування порогів ліміту</CardTitle>
                </div>
                <CardDescription>
                  {fopLimit.group} група — ліміт {(fopLimit.limit / 1000000).toFixed(2)} млн ₴ на {new Date().getFullYear()} рік
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="warnAt70" defaultChecked />
                    <Label htmlFor="warnAt70">Попереджати при 70% ліміту</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="warnAt90" defaultChecked />
                    <Label htmlFor="warnAt90">Критичне попередження при 90%</Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notifyDays">Сповіщати за N днів до прогнозованого досягнення</Label>
                  <div className="flex items-center gap-2">
                    <Input id="notifyDays" defaultValue="30" className="w-20 tabular-nums" />
                    <span className="text-muted-foreground text-sm">днів</span>
                  </div>
                </div>

                <div className="rounded-lg border bg-muted/50 p-3 text-sm">
                  <p className="text-muted-foreground">
                    Поточний стан: використано {fopLimit.usedPercent.toFixed(1)}% ліміту. 
                    {fopLimit.forecast && fopLimit.forecast > 0 && (
                      <> При поточному темпі ліміт буде досягнуто приблизно за {fopLimit.forecast} міс.</>
                    )}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* TOV Tax Profile */}
      {cabinet.type === "tov" && (
        <Card className={cn("border-l-4 hover:shadow-md transition-all", entityStyle.borderColor)}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className={cn("h-5 w-5", entityStyle.color)} />
              <CardTitle className="text-base">Система оподаткування</CardTitle>
            </div>
            <CardDescription>Параметри для юридичної особи</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="taxSystem">Система оподаткування <span className="text-destructive">*</span></Label>
                <Select defaultValue="general">
                  <SelectTrigger id="taxSystem">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">Загальна система</SelectItem>
                    <SelectItem value="simplified">Спрощена система (демо)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 pt-6">
                <Switch id="vatPayer" defaultChecked />
                <Label htmlFor="vatPayer">Платник ПДВ</Label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center space-x-2">
                <Switch id="hasBranches" />
                <Label htmlFor="hasBranches">Відокремлені підрозділи</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reportFrequency">Періодичність звітності</Label>
                <Select defaultValue="month">
                  <SelectTrigger id="reportFrequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="month">Щомісячна</SelectItem>
                    <SelectItem value="quarter">Квартальна</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Базові правила податкового планування (демо)</Label>
              <div className="rounded-lg border bg-muted/50 p-3 text-sm text-muted-foreground">
                <ul className="list-disc list-inside space-y-1">
                  <li>Оптимізація витрат через правильну класифікацію</li>
                  <li>Моніторинг податкових ризиків</li>
                  <li>Автоматичний контроль дедлайнів</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* FOP Group Policies */}
      {cabinet.type === "fop-group" && (
        <Card className={cn("border-l-4 hover:shadow-md transition-all", entityStyle.borderColor)}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className={cn("h-5 w-5", entityStyle.color)} />
              <CardTitle className="text-base">Політики групи</CardTitle>
            </div>
            <CardDescription>Єдині налаштування для всіх ФОП у групі</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch id="unifiedWarnings" defaultChecked />
                <Label htmlFor="unifiedWarnings">Єдині попередження по лімітах</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="unifiedCategories" defaultChecked />
                <Label htmlFor="unifiedCategories">Єдина матриця категорій</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="unifiedTemplates" defaultChecked />
                <Label htmlFor="unifiedTemplates">Єдині шаблони документів</Label>
              </div>
            </div>

            <div className="rounded-lg border bg-muted/50 p-3 text-sm">
              <p className="font-medium mb-2">Зведена статистика групи:</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <div>
                  <p className="text-muted-foreground">Всього ФОП</p>
                  <p className="font-semibold tabular-nums">3</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Сер. використання ліміту</p>
                  <p className="font-semibold tabular-nums">52.4%</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Потребують уваги</p>
                  <p className="font-semibold text-warning tabular-nums">1</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Tax Profile */}
      {cabinet.type === "individual" && (
        <Card className={cn("border-l-4 hover:shadow-md transition-all", entityStyle.borderColor)}>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Receipt className={cn("h-5 w-5", entityStyle.color)} />
              <CardTitle className="text-base">Податковий профіль</CardTitle>
            </div>
            <CardDescription>Параметри для фізичної особи</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="profileType">Тип профілю <span className="text-destructive">*</span></Label>
              <Select defaultValue="pdfo">
                <SelectTrigger id="profileType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdfo">ПДФО (загальний)</SelectItem>
                  <SelectItem value="landlord">Орендодавець</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Параметри автозаповнення декларацій</Label>
              <div className="space-y-2 pt-2">
                <div className="flex items-center space-x-2">
                  <Switch id="useDiia" defaultChecked />
                  <Label htmlFor="useDiia">Використовувати дані з Дія</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="useBankData" defaultChecked />
                  <Label htmlFor="useBankData">Використовувати дані з банків</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="useRegistries" />
                  <Label htmlFor="useRegistries">Використовувати дані з реєстрів (демо)</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button size="lg">Зберегти зміни</Button>
      </div>
    </div>
  );
};
