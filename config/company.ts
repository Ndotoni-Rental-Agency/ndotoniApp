/**
 * Centralized company information and configuration
 * Update this file to change company details across the entire application
 */

export const COMPANY_INFO = {
  // Basic Information
  name: 'ndotoni',
  fullName: 'ndotoni Property Solutions',
  tagline: 'Your Gateway to Quality Housing',
  description: 'Tanzania\'s leading property rental platform connecting quality tenants with verified landlords.',
  
  // Contact Information
  contact: {
    phone: {
      primary: '+255 756 502 853',
      whatsapp: '+255 756 502 853',
      formatted: '+255 756 502 853',
    },
    email: {
      primary: 'info@ndotoni.com',
      support: 'info@ndotoni.com',
      partnerships: 'info@ndotoni.com',
      careers: 'info@ndotoni.com',
    },
    address: {
      street: 'Msimbazi Street, Kariakoo',
      city: 'Dar es Salaam',
      region: 'Dar es Salaam',
      country: 'Tanzania',
      postalCode: '11101',
      full: 'Msimbazi Street, Kariakoo, Dar es Salaam, Tanzania',
    },
  },

  // Business Hours
  hours: {
    weekdays: {
      open: '08:00',
      close: '18:00',
      display: '8:00 AM - 6:00 PM',
    },
    saturday: {
      open: '09:00',
      close: '16:00',
      display: '9:00 AM - 4:00 PM',
    },
    sunday: {
      open: null,
      close: null,
      display: 'Closed',
    },
  },

  // Social Media
  social: {
    facebook: 'https://www.facebook.com/share/1Fcbhe9sxm/?mibextid=wwXIfr',
    twitter: 'https://x.com/ndotonirentals?s=21',
    instagram: 'https://www.instagram.com/ndotoni_rentals?igsh=eWY3c2YwbWFmejJo&utm_source=qr',
    linkedin: 'https://www.linkedin.com/in/ndotoni-rentals-02571a3ab',
    youtube: 'https://youtube.com/@ndotoni',
    whatsapp: 'https://wa.me/12164136022',
  },

  // Mission & Vision
  mission: 'To revolutionize the property rental experience in Tanzania by connecting quality tenants with verified landlords through innovative technology and exceptional service.',
  
  vision: 'To become East Africa\'s most trusted property rental platform, making quality housing accessible to everyone.',

  // Core Values
  values: [
    {
      title: 'Transparency',
      description: 'Clear communication and transparent processes in all our dealings.',
    },
    {
      title: 'Quality',
      description: 'High standards in property verification and customer service.',
    },
  ],

  // Statistics
  stats: {
    propertiesListed: '10,000+',
    happyTenants: '25,000+',
    yearsOfExperience: '8+',
  },

  // Team Information
  team: [
    {
      name: 'Emmanuel Makoye',
      role: 'CEO',
      bio: 'Tech entrepreneur passionate about creating seamless digital experiences.',
      initials: 'EM',
      color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    },
    {
      name: 'Elisha Kato',
      role: 'CTO',
      bio: 'Operations expert focused on streamlining processes and customer service.',
      initials: 'EK',
      color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
    },
  ],

  // Office Locations
  offices: [
    {
      name: 'Dar es Salaam Office',
      address: 'Msimbazi Street, Kariakoo',
      city: 'Dar es Salaam',
      phone: '+255 756 502 853',
      email: 'info@ndotoni.com',
      isHeadquarters: true,
    },
  ],

  // Legal Information
  legal: {
    companyRegistration: 'RC 123456',
    vatNumber: 'VAT 123456789',
    businessLicense: 'BL 123456',
    establishedYear: 2016,
  },

  // Features & Services
  features: [
    {
      title: 'Verified Properties',
      description: 'All properties are thoroughly verified before listing',
    },
    {
      title: 'Secure Platform',
      description: 'Safe and secure platform for all your rental needs',
    },
  ],

  // Why Choose Us
  whyChooseUs: [
    {
      title: 'Trusted Platform',
      description: 'Over 8 years of experience serving the Tanzanian property market',
    },
    {
      title: 'Quality Assurance',
      description: 'Every property and landlord is verified for your peace of mind',
    },
  ],
} as const;

// Helper functions
export const getFormattedAddress = (includeCountry = true) => {
  const { address } = COMPANY_INFO.contact;
  return includeCountry ? address.full : `${address.street}, ${address.city}`;
};

export const getBusinessHours = (day: 'weekdays' | 'saturday' | 'sunday') => {
  return COMPANY_INFO.hours[day];
};

export const getPrimaryContact = () => ({
  phone: COMPANY_INFO.contact.phone.primary,
  email: COMPANY_INFO.contact.email.primary,
  whatsapp: COMPANY_INFO.social.whatsapp,
});

export const getOfficeByCity = (city: string) => {
  return COMPANY_INFO.offices.find(office => 
    office.city.toLowerCase() === city.toLowerCase()
  );
};

export const getHeadquarters = () => {
  return COMPANY_INFO.offices.find(office => office.isHeadquarters);
};