import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import ContentDetailPage from "@/admin/components/ContentDetailPage";

import { INSTITUTION_PROFILES } from "@/portal/data/institutionProfiles";
import { COURSES } from "@/portal/data/learn";
import { LICENSES } from "@/portal/data/licenses";
import { KVED_ENTRIES } from "@/portal/data/kved";
import { TEMPLATES } from "@/portal/data/templates";
import { REGISTERS } from "@/portal/data/registers";
import { RATE_TABLES } from "@/portal/data/rates";
import { BUSINESS_FORMS } from "@/portal/data/businessForms";
import { ACCOUNTANTS } from "@/portal/data/accountants";

// Data imports
import { ARTICLES } from "@/portal/data/articles";
import { mockConsultations } from "@/config/consultationMockData";

import { RANKINGS } from "@/portal/data/rankings";
import { GRANTS } from "@/portal/data/grants";
import { PENALTIES } from "@/portal/data/penalties";
import { KNOWLEDGE } from "@/portal/data/knowledge";
import { LAWS } from "@/portal/data/laws";

// Schemas
import {
  articleSchema, consultationSchema,
  rankingSchema, grantSchema, penaltySchema, knowledgeSchema, lawSchema,
  institutionProfileSchema, courseSchema, kvedSchema, licenseSchema,
  templateSchema, registerSchema, rateTableSchema, businessFormSchema, accountantSchema,
} from "@/admin/schemas/contentSchemas";

const CONFIG: Record<string, {
  getData: () => any[];
  schema: any[];
  title: string;
  previewType: string;
  idKey: string;
  portalPrefix?: string;
  backPath: string;
  backLabel: string;
}> = {
  article: {
    getData: () => ARTICLES,
    schema: articleSchema,
    title: "Стаття",
    previewType: "article",
    idKey: "slug",
    portalPrefix: "/articles",
    backPath: "/admin/articles",
    backLabel: "Статті",
  },
  consultation: {
    getData: () => mockConsultations,
    schema: consultationSchema,
    title: "Консультація",
    previewType: "consultation",
    idKey: "slug",
    portalPrefix: "/consultations",
    backPath: "/admin/consultations",
    backLabel: "Консультації",
  },
  ranking: {
    getData: () => RANKINGS,
    schema: rankingSchema,
    title: "Рейтинг",
    previewType: "ranking",
    idKey: "slug",
    backPath: "/admin/rankings",
    backLabel: "Рейтинги",
  },
  grant: {
    getData: () => GRANTS,
    schema: grantSchema,
    title: "Грант",
    previewType: "grant",
    idKey: "slug",
    portalPrefix: "/dovidnyky/granty",
    backPath: "/admin/grants",
    backLabel: "Гранти",
  },
  penalty: {
    getData: () => PENALTIES,
    schema: penaltySchema,
    title: "Штраф",
    previewType: "penalty",
    idKey: "id",
    portalPrefix: "/dovidnyky/penalties",
    backPath: "/admin/penalties",
    backLabel: "Штрафи",
  },
  knowledge: {
    getData: () => KNOWLEDGE,
    schema: knowledgeSchema,
    title: "Термін",
    previewType: "knowledge",
    idKey: "slug",
    portalPrefix: "/dovidnyky/slovnyk",
    backPath: "/admin/knowledge",
    backLabel: "Словник",
  },
  law: {
    getData: () => LAWS,
    schema: lawSchema,
    title: "Закон",
    previewType: "law",
    idKey: "slug",
    portalPrefix: "/dovidnyky/zakony",
    backPath: "/admin/laws",
    backLabel: "Закони",
  },
  institution: {
    getData: () => INSTITUTION_PROFILES,
    schema: institutionProfileSchema,
    title: "Установа",
    previewType: "institution",
    idKey: "slug",
    portalPrefix: "/dovidnyky/ustanovy/profile",
    backPath: "/admin/institution-profiles",
    backLabel: "Профілі установ",
  },
  course: {
    getData: () => COURSES,
    schema: courseSchema,
    title: "Курс",
    previewType: "course",
    idKey: "slug",
    portalPrefix: "/learn",
    backPath: "/admin/courses",
    backLabel: "Курси",
  },
  kved: {
    getData: () => KVED_ENTRIES,
    schema: kvedSchema,
    title: "КВЕД",
    previewType: "kved",
    idKey: "code",
    portalPrefix: "/dovidnyky/kved",
    backPath: "/admin/kved",
    backLabel: "КВЕД",
  },
  license: {
    getData: () => LICENSES,
    schema: licenseSchema,
    title: "Ліцензія",
    previewType: "license",
    idKey: "slug",
    portalPrefix: "/dovidnyky/litsenziyi",
    backPath: "/admin/licenses",
    backLabel: "Ліцензії",
  },
  template: {
    getData: () => TEMPLATES,
    schema: templateSchema,
    title: "Шаблон",
    previewType: "template",
    idKey: "slug",
    portalPrefix: "/dovidnyky/templates",
    backPath: "/admin/templates",
    backLabel: "Шаблони",
  },
  register: {
    getData: () => REGISTERS,
    schema: registerSchema,
    title: "Реєстр",
    previewType: "register",
    idKey: "slug",
    portalPrefix: "/dovidnyky/reestry",
    backPath: "/admin/registers",
    backLabel: "Реєстри",
  },
  rate: {
    getData: () => RATE_TABLES,
    schema: rateTableSchema,
    title: "Ставка",
    previewType: "rate",
    idKey: "slug",
    portalPrefix: "/dovidnyky/stavky",
    backPath: "/admin/rates",
    backLabel: "Ставки",
  },
  businessForm: {
    getData: () => BUSINESS_FORMS,
    schema: businessFormSchema,
    title: "Форма бізнесу",
    previewType: "businessForm",
    idKey: "slug",
    portalPrefix: "/dovidnyky/formy-biznesu",
    backPath: "/admin/business-forms",
    backLabel: "Форми бізнесу",
  },
  accountant: {
    getData: () => ACCOUNTANTS,
    schema: accountantSchema,
    title: "Бухгалтер",
    previewType: "accountant",
    idKey: "slug",
    portalPrefix: "/dovidnyky/accountants",
    backPath: "/admin/accountants",
    backLabel: "Бухгалтери",
  },
};

export default function ContentDetailRoute() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();

  const config = type ? CONFIG[type] : undefined;

  const allItems = useMemo(() => config?.getData() ?? [], [config]);

  const [currentId, setCurrentId] = useState(id);
  const item = useMemo(() => {
    if (!config) return null;
    return allItems.find((item: any) => String(item[config.idKey]) === currentId) || null;
  }, [allItems, config, currentId]);

  if (!config || !item) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Запис не знайдено</p>
      </div>
    );
  }

  const portalPath = config.portalPrefix ? `${config.portalPrefix}/${item[config.idKey]}` : undefined;

  return (
    <ContentDetailPage
      data={item}
      schema={config.schema}
      title={config.title}
      previewType={config.previewType}
      portalPath={portalPath}
      allItems={allItems}
      onNavigate={(newItem) => {
        setCurrentId(String(newItem[config.idKey]));
        navigate(`/admin/content/${type}/${newItem[config.idKey]}`, { replace: true });
      }}
      backPath={config.backPath}
      backLabel={config.backLabel}
    />
  );
}
