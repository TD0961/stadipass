import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

export default function EventsSection() {
  return (
    <section className="py-20 px-4 md:px-20 text-center relative">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="text-center mb-4"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-3 text-white">Upcoming Events</h2>
          <p className="text-gray-300 text-lg">Discover and book tickets for the most exciting events happening near you</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
        {[
          { title: 'Football Match', desc: 'Live sports action with top teams', date: 'This Weekend', featured: true },
          { title: 'Basketball Game', desc: 'High-energy basketball championship', date: 'Next Week' },
          { title: 'Concert', desc: 'World-class music and entertainment', date: 'Coming Soon' },
          { title: 'Rugby Match', desc: 'Intense rugby tournament matches', date: 'This Month' }
        ].map((event, index) => (
          <motion.div
            key={event.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ 
              duration: 0.5, 
              delay: index * 0.1, 
              ease: [0.4, 0, 0.2, 1]
            }}
            className={`p-6 rounded-xl border transition-all duration-300 ease-in-out text-white shadow-lg ${
              event.featured 
                ? 'border-[#00f5a0] ring-2 ring-[#00f5a0]/50 bg-gradient-to-br from-[#0a0f1e] to-[#030712] shadow-[#00f5a0]/20' 
                : 'border-gray-700/50 bg-[#0a0f1e] hover:border-[#00f5a0]/50 hover:shadow-[#00f5a0]/10'
            }`}
          >
            <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
              event.featured 
                ? 'bg-[#00f5a0]/20 text-[#00f5a0]' 
                : 'bg-gray-700/50 text-gray-300'
            }`}>
              {event.date}
            </div>
            <h3 className="text-xl font-bold mb-2 text-white">{event.title}</h3>
            <p className="text-gray-300 mb-5 text-sm leading-relaxed">{event.desc}</p>
            <Link to="/events">
              <Button className={`w-full ${event.featured ? 'bg-gradient-to-r from-[#00f5a0] to-[#00d9ff] hover:from-[#00d9ff] hover:to-[#00f5a0]' : ''}`}>
                View Details
              </Button>
            </Link>
          </motion.div>
        ))}
        </div>
      </div>
    </section>
  );
}

