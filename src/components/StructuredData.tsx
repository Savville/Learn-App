import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface BreadcrumbItem {
    name: string;
    url?: string;
}

interface Props {
    type?: 'website' | 'jobPosting' | 'faqPage' | 'breadcrumbList';
    title: string;
    description: string;
    url: string;
    imageUrl?: string;
    breadcrumbs?: BreadcrumbItem[];
    faqs?: { question: string; answer: string }[];
    jobPosting?: {
        title: string;
        description: string;
        employmentType: string;
        jobLocation: { address: { addressLocality: string; addressRegion: string; addressCountry: string } };
        hiringOrganization: { name: string; sameAs?: string };
        datePosted?: string;
        baseSalary?: { currency: string; value: { minAmount?: string; maxAmount?: string; unitText?: string } };
    };
}

export function StructuredData({ type = 'website', title, description, url, imageUrl, breadcrumbs, faqs, jobPosting }: Props) {
    const location = useLocation();

    useEffect(() => {
        // Remove old scripts
        document.querySelectorAll('script[data-seo-structured]').forEach(el => el.remove());

        // Website/Article schema (always present)
        const websiteScript = document.createElement('script');
        websiteScript.setAttribute('data-seo-structured', 'true');
        websiteScript.type = 'application/ld+json';

        const baseSchema = {
            '@context': 'https://schema.org',
            '@type': type === 'jobPosting' ? 'JobPosting' : 'WebPage',
            name: title,
            description,
            url,
        };

        if (imageUrl) {
            (baseSchema as any).image = imageUrl;
        }

        if (type === 'jobPosting' && jobPosting) {
            const jobSchema = {
                ...baseSchema,
                '@type': 'JobPosting',
                title: jobPosting.title,
                description: jobPosting.description,
                employmentType: jobPosting.employmentType,
                hiringOrganization: {
                    '@type': 'Organization',
                    name: jobPosting.hiringOrganization.name,
                    ...(jobPosting.hiringOrganization.sameAs ? { sameAs: jobPosting.hiringOrganization.sameAs } : {}),
                },
                jobLocation: jobPosting.jobLocation,
                datePosted: jobPosting.datePosted || new Date().toISOString().split('T')[0],
                ...(jobPosting.baseSalary ? { baseSalary: jobPosting.baseSalary } : {}),
            };
            websiteScript.textContent = JSON.stringify(jobSchema, null, 2);
        } else {
            websiteScript.textContent = JSON.stringify(baseSchema, null, 2);
        }

        document.head.appendChild(websiteScript);

        // BreadcrumbList schema
        if (breadcrumbs && breadcrumbs.length > 0) {
            const breadcrumbScript = document.createElement('script');
            breadcrumbScript.setAttribute('data-seo-structured', 'true');
            breadcrumbScript.type = 'application/ld+json';

            const breadcrumbSchema = {
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: breadcrumbs.map((item, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    name: item.name,
                    ...(item.url ? { item: item.url } : {}),
                })),
            };

            breadcrumbScript.textContent = JSON.stringify(breadcrumbSchema, null, 2);
            document.head.appendChild(breadcrumbScript);
        }

        // FAQPage schema
        if (faqs && faqs.length > 0) {
            const faqScript = document.createElement('script');
            faqScript.setAttribute('data-seo-structured', 'true');
            faqScript.type = 'application/ld+json';

            const faqSchema = {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqs.map(faq => ({
                    '@type': 'Question',
                    name: faq.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: faq.answer,
                    },
                })),
            };

            faqScript.textContent = JSON.stringify(faqSchema, null, 2);
            document.head.appendChild(faqScript);
        }

        return () => {
            document.querySelectorAll('script[data-seo-structured]').forEach(el => el.remove());
        };
    }, [location.pathname, type, title, description, url, imageUrl, breadcrumbs, faqs, jobPosting]);

    return null;
}

// Default website schema (used on all pages)
export function DefaultStructuredData() {
    return (
        <StructuredData
            type="website"
            title="Opportunities Kenya — Find Gigs, Internships, Scholarships & More"
            description="Discover paid micro-gigs, internships, scholarships, grants, and freelance opportunities for African students and young professionals. Companies source vetted student talent."
            url="https://opportunitieskenya.live"
            imageUrl="https://opportunitieskenya.live/Opportunities Kenya Logo 2.png"
        />
    );
}