import Layout from '../components/layout/Layout';
import HeroSection from '../components/sections/HeroSection';
import EventsSection from '../components/sections/EventsSection';
import WhyChooseUsSection from '../components/sections/WhyChooseUsSection';
import TicketCategoriesSection from '../components/sections/TicketCategoriesSection';

export default function HomePage() {
  return (
    <Layout>
      <div id="home">
        <HeroSection />
      </div>
      <div id="events">
        <EventsSection />
      </div>
      <div id="about">
        <WhyChooseUsSection />
      </div>
      <div id="pricing">
        <TicketCategoriesSection />
      </div>
    </Layout>
  );
}
