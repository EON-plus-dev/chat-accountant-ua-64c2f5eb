import { useParams } from 'react-router-dom';
import { PortalLayout } from '@/portal/layouts/PortalLayout';
import { BreadcrumbNav } from '@/portal/components/BreadcrumbNav';
import { GovBranchDetail } from '@/portal/components/gov/GovBranchDetail';
import { JsonLd } from '@/components/seo/JsonLd';
import { getBreadcrumbSchema, SITE_URL } from '@/portal/seo/structuredData';
import { useGovBranch } from '@/portal/hooks/useGovBranches';

const GovBranchDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: branch } = useGovBranch(id);

  const branchName = branch?.name || 'Відділення';

  return (
    <PortalLayout
      meta={{
        title: `${branchName} — каталог держорганів | FINTODO`,
        description: branch
          ? `${branchName}: графік роботи, послуги, контакти. ${branch.city}, ${branch.region} обл.`
          : 'Детальна інформація про відділення: графік роботи, послуги, документи, контакти.',
        canonical: `${SITE_URL}/dovidnyky/ustanovy/gov/branch/${id}`,
      }}
    >
      {branch && (
        <>
          <JsonLd data={{
            '@context': 'https://schema.org',
            '@type': 'GovernmentOffice',
            name: branch.name,
            address: {
              '@type': 'PostalAddress',
              streetAddress: branch.address,
              addressLocality: branch.city,
              addressRegion: branch.region,
              addressCountry: 'UA',
            },
            ...(branch.phones?.length ? { telephone: branch.phones[0] } : {}),
            ...(branch.email ? { email: branch.email } : {}),
            ...(branch.website ? { url: branch.website } : {}),
            ...(branch.lat && branch.lng ? { geo: { '@type': 'GeoCoordinates', latitude: branch.lat, longitude: branch.lng } } : {}),
          }} />
          <JsonLd data={getBreadcrumbSchema([
            { name: 'Головна', url: SITE_URL },
            { name: 'Довідники', url: `${SITE_URL}/dovidnyky` },
            { name: 'Установи', url: `${SITE_URL}/dovidnyky/ustanovy` },
            { name: 'Держоргани', url: `${SITE_URL}/dovidnyky/ustanovy?cat=gov` },
            { name: branchName, url: `${SITE_URL}/dovidnyky/ustanovy/gov/branch/${id}` },
          ])} />
        </>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 md:pb-8">
        <BreadcrumbNav
          items={[
            { label: 'Головна', to: '/' },
            { label: 'Довідники', to: '/dovidnyky' },
            { label: 'Каталог установ', to: '/dovidnyky/ustanovy' },
            { label: 'Держоргани', to: '/dovidnyky/ustanovy?cat=gov' },
            { label: branchName },
          ]}
        />
        <GovBranchDetail branchId={id || ''} />
      </div>
    </PortalLayout>
  );
};

export default GovBranchDetailPage;
