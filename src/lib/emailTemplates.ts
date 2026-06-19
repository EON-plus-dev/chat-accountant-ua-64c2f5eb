/**
 * Generates HTML for team invite email - client-side preview version
 * Mirrors the Edge Function template for consistent previews
 */

const cabinetTypeLabels: Record<string, string> = {
  fop: "ФОП",
  tov: "ТОВ",
  individual: "Фізична особа",
};

interface TeamInviteEmailProps {
  cabinetName: string;
  cabinetType: string;
  inviterName: string;
  inviterRole: string;
  inviteeEmail: string;
  roleLabel: string;
  inviteCode: string;
  personalMessage?: string;
}

export function generateTeamInviteEmailHtml(props: TeamInviteEmailProps): string {
  const typeLabel = cabinetTypeLabels[props.cabinetType] || props.cabinetType;
  const inviteLink = `${window.location.origin}/add-cabinet?code=${props.inviteCode}`;
  const expiresIn = "7 днів";
  
  const personalMessageHtml = props.personalMessage ? `
    <div style="background-color: #f9fafb; border-radius: 8px; margin: 16px 0; padding: 16px;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Повідомлення:</p>
      <p style="color: #374151; font-size: 15px; font-style: italic; line-height: 1.6; margin: 0;">«${props.personalMessage}»</p>
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Запрошення до кабінету</title>
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 20px 0;">
  <div style="background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; max-width: 600px; border-radius: 8px;">
    
    <!-- Header -->
    <div style="padding: 24px 40px 0;">
      <p style="font-size: 20px; font-weight: 600; color: #1a1a2e; margin: 0;">📋 Електронний Кабінет</p>
    </div>
    
    <!-- Hero -->
    <h1 style="color: #1a1a2e; font-size: 24px; font-weight: 600; line-height: 1.3; margin: 32px 40px 8px; padding: 0;">
      Вас запрошено до кабінету
    </h1>
    <p style="color: #3b82f6; font-size: 22px; font-weight: 700; margin: 0 40px 8px;">
      «${props.cabinetName}»
    </p>
    <p style="color: #6b7280; font-size: 14px; margin: 0 40px 24px;">
      ${typeLabel}
    </p>
    
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 24px 40px;">
    
    <!-- Inviter Info -->
    <div style="padding: 0 40px;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
        <strong>${props.inviterName}</strong> (${props.inviterRole}) запрошує вас приєднатися до команди.
      </p>
    </div>
    
    <!-- Role Badge -->
    <div style="padding: 0 40px; margin-bottom: 16px;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">Ваша роль:</p>
      <span style="display: inline-block; background-color: #eff6ff; color: #1d4ed8; font-size: 16px; font-weight: 600; padding: 8px 16px; border-radius: 8px;">
        🏷️ ${props.roleLabel}
      </span>
    </div>
    
    <!-- Personal Message -->
    ${personalMessageHtml}
    
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 24px 40px;">
    
    <!-- Invite Code Block -->
    <div style="text-align: center; padding: 24px 40px;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px;">Ваш код запрошення:</p>
      <div style="background-color: #1a1a2e; color: #ffffff; font-size: 28px; font-weight: 700; font-family: monospace; letter-spacing: 4px; padding: 20px 32px; border-radius: 12px; display: inline-block;">
        ${props.inviteCode}
      </div>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; padding: 8px 40px 24px;">
      <a href="${inviteLink}" style="background-color: #3b82f6; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 32px;">
        Приєднатися до команди
      </a>
    </div>
    
    <!-- Link Fallback -->
    <div style="text-align: center; padding: 0 40px 16px;">
      <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">Або скопіюйте посилання:</p>
      <a href="${inviteLink}" style="color: #3b82f6; font-size: 13px; word-break: break-all;">
        ${inviteLink}
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 24px 40px;">
    
    <!-- Instructions -->
    <div style="background-color: #f0fdf4; border-radius: 8px; margin: 16px 40px; padding: 20px;">
      <p style="color: #166534; font-size: 15px; font-weight: 600; margin: 0 0 12px;">Як приєднатися:</p>
      <p style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0;">
        1. Натисніть кнопку «Приєднатися до команди» або відкрийте посилання<br>
        2. Введіть код <strong>${props.inviteCode}</strong> (якщо потрібно)<br>
        3. Підтвердьте свою особу через КЕП або Дія.Підпис<br>
        4. Готово — ви в команді! 🎉
      </p>
    </div>
    
    <!-- Expiry Notice -->
    <div style="text-align: center; padding: 8px 40px;">
      <p style="color: #9ca3af; font-size: 14px; margin: 0;">
        ⏰ Запрошення дійсне ${expiresIn}
      </p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 24px 40px;">
    
    <!-- Footer -->
    <div style="padding: 0 40px;">
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0 0 8px;">
        Цей лист надіслано на адресу ${props.inviteeEmail}, оскільки вас запросили приєднатися до кабінету «${props.cabinetName}».
      </p>
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0 0 8px;">
        Якщо ви не очікували цього листа, просто проігноруйте його.
      </p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">
        © Електронний Кабінет
      </p>
    </div>
    
  </div>
</body>
</html>
  `;
}

/**
 * Generates HTML for contractor invite email - client-side preview version
 */

interface ContractorInviteEmailProps {
  inviterCabinetName: string;
  inviterCabinetType: string;
  inviterName: string;
  contractorName?: string;
  contractorCode?: string;
  inviteeEmail: string;
  inviteCode: string;
  relationshipType: "buyer" | "supplier" | "both";
  personalMessage?: string;
}

const relationshipLabels: Record<string, string> = {
  buyer: "Покупець",
  supplier: "Постачальник",
  both: "Покупець і постачальник",
};

export function generateContractorInviteEmailHtml(props: ContractorInviteEmailProps): string {
  const typeLabel = cabinetTypeLabels[props.inviterCabinetType] || props.inviterCabinetType;
  const inviteLink = `${window.location.origin}/contractor-onboarding?code=${props.inviteCode}&from=${encodeURIComponent(props.inviterCabinetName)}`;
  const relationshipLabel = relationshipLabels[props.relationshipType] || props.relationshipType;
  const expiresIn = "30 днів";
  
  const personalMessageHtml = props.personalMessage ? `
    <div style="background-color: #f9fafb; border-radius: 8px; margin: 16px 0; padding: 16px;">
      <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 0.5px;">Повідомлення від запрошувача:</p>
      <p style="color: #374151; font-size: 15px; font-style: italic; line-height: 1.6; margin: 0;">«${props.personalMessage}»</p>
    </div>
  ` : '';

  const contractorInfoHtml = props.contractorName ? `
    <div style="background-color: #eff6ff; border-radius: 8px; margin: 16px 40px; padding: 16px;">
      <p style="color: #1d4ed8; font-size: 14px; font-weight: 600; margin: 0 0 4px;">Ваші дані в системі:</p>
      <p style="color: #374151; font-size: 16px; margin: 0;">${props.contractorName}</p>
      ${props.contractorCode ? `<p style="color: #6b7280; font-size: 14px; font-family: monospace; margin: 4px 0 0;">${props.contractorCode.length === 8 ? 'ЄДРПОУ' : 'ІПН'}: ${props.contractorCode}</p>` : ''}
    </div>
  ` : '';

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Запрошення до співпраці</title>
</head>
<body style="background-color: #f6f9fc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Ubuntu, sans-serif; margin: 0; padding: 20px 0;">
  <div style="background-color: #ffffff; margin: 0 auto; padding: 20px 0 48px; max-width: 600px; border-radius: 8px;">
    
    <!-- Header -->
    <div style="padding: 24px 40px 0;">
      <p style="font-size: 20px; font-weight: 600; color: #1a1a2e; margin: 0;">🤝 AI-Бухгалтер</p>
    </div>
    
    <!-- Hero -->
    <h1 style="color: #1a1a2e; font-size: 24px; font-weight: 600; line-height: 1.3; margin: 32px 40px 8px; padding: 0;">
      Запрошення до співпраці
    </h1>
    <p style="color: #3b82f6; font-size: 22px; font-weight: 700; margin: 0 40px 8px;">
      від «${props.inviterCabinetName}»
    </p>
    <p style="color: #6b7280; font-size: 14px; margin: 0 40px 24px;">
      ${typeLabel}
    </p>
    
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 24px 40px;">
    
    <!-- Inviter Info -->
    <div style="padding: 0 40px;">
      <p style="color: #374151; font-size: 16px; line-height: 1.6; margin: 0 0 16px;">
        <strong>${props.inviterName}</strong> запрошує вас синхронізувати реквізити для зручного електронного документообігу.
      </p>
    </div>
    
    <!-- Relationship Type -->
    <div style="padding: 0 40px; margin-bottom: 16px;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 8px;">Тип співпраці:</p>
      <span style="display: inline-block; background-color: #f0fdf4; color: #166534; font-size: 16px; font-weight: 600; padding: 8px 16px; border-radius: 8px;">
        🏷️ ${relationshipLabel}
      </span>
    </div>
    
    <!-- Contractor Info (if available) -->
    ${contractorInfoHtml}
    
    <!-- Personal Message -->
    ${personalMessageHtml}
    
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 24px 40px;">
    
    <!-- Invite Code Block -->
    <div style="text-align: center; padding: 24px 40px;">
      <p style="color: #6b7280; font-size: 14px; margin: 0 0 12px;">Ваш код запрошення:</p>
      <div style="background-color: #1a1a2e; color: #ffffff; font-size: 28px; font-weight: 700; font-family: monospace; letter-spacing: 4px; padding: 20px 32px; border-radius: 12px; display: inline-block;">
        ${props.inviteCode}
      </div>
    </div>
    
    <!-- CTA Button -->
    <div style="text-align: center; padding: 8px 40px 24px;">
      <a href="${inviteLink}" style="background-color: #10b981; border-radius: 8px; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block; padding: 14px 32px;">
        Розпочати реєстрацію
      </a>
    </div>
    
    <!-- Link Fallback -->
    <div style="text-align: center; padding: 0 40px 16px;">
      <p style="color: #6b7280; font-size: 13px; margin: 0 0 8px;">Або скопіюйте посилання:</p>
      <a href="${inviteLink}" style="color: #3b82f6; font-size: 13px; word-break: break-all;">
        ${inviteLink}
      </a>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 24px 40px;">
    
    <!-- Benefits -->
    <div style="background-color: #f0fdf4; border-radius: 8px; margin: 16px 40px; padding: 20px;">
      <p style="color: #166534; font-size: 15px; font-weight: 600; margin: 0 0 12px;">🎁 Переваги реєстрації:</p>
      <p style="color: #374151; font-size: 14px; line-height: 1.8; margin: 0;">
        ✓ Безкоштовний пасивний кабінет<br>
        ✓ Автоматичне оновлення реквізитів у партнерів<br>
        ✓ Швидке підписання документів<br>
        ✓ <strong>+5K кредитів</strong> за реєстрацію
      </p>
    </div>
    
    <!-- Expiry Notice -->
    <div style="text-align: center; padding: 8px 40px;">
      <p style="color: #9ca3af; font-size: 14px; margin: 0;">
        ⏰ Запрошення дійсне ${expiresIn}
      </p>
    </div>
    
    <hr style="border: none; border-top: 1px solid #e6ebf1; margin: 24px 40px;">
    
    <!-- Footer -->
    <div style="padding: 0 40px;">
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0 0 8px;">
        Цей лист надіслано на адресу ${props.inviteeEmail}, оскільки вас запросили до електронного документообігу компанією «${props.inviterCabinetName}».
      </p>
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 0 0 8px;">
        Якщо ви не очікували цього листа, просто проігноруйте його.
      </p>
      <p style="color: #6b7280; font-size: 12px; margin-top: 16px;">
        © AI-Бухгалтер
      </p>
    </div>
    
  </div>
</body>
</html>
  `;
}