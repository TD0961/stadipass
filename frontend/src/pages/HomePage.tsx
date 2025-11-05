import Layout from '../components/layout/Layout';
import HeroSection from '../components/sections/HeroSection';
import EventsSection from '../components/sections/EventsSection';
import WhyChooseUsSection from '../components/sections/WhyChooseUsSection';
import TicketCategoriesSection from '../components/sections/TicketCategoriesSection';

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <EventsSection />
      <WhyChooseUsSection />
      <TicketCategoriesSection />
    </Layout>
  );
}
