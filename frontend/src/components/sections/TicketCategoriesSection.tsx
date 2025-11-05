import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';

export default function TicketCategoriesSection() {
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
          <h2 className="text-4xl md:text-5xl font-bold mb-3 text-white">Ticket Categories</h2>
          <p className="text-gray-300 text-lg">Choose the perfect ticket option for your stadium experience</p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        {[
          { 
            title: 'Regular', 
            price: '$25', 
            period: 'per ticket',
            features: ['Standard seating area', 'Full event access', 'Digital ticket delivery', 'Email customer support', 'Mobile app access'],
            popular: false
          },
          { 
            title: 'Premium', 
            price: '$45', 
            period: 'per ticket',
            features: ['VIP seating section', 'Priority customer support', 'Early gate entry', 'Exclusive perks', '24/7 assistance'],
            popular: true,
            featured: true
          },
          { 
            title: 'VIP', 
            price: '$75', 
            period: 'per ticket',
            features: ['Best seats in stadium', 'Dedicated 24/7 support', 'VIP lounge access', 'Complimentary refreshments', 'Meet & greet opportunities'],
            popular: false
          }
        ].map((plan, index) => (
          <motion.div
            key={plan.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.3 }}
            whileHover={{ scale: 1.05, y: -5 }}
            transition={{ 
              duration: 0.6, 
              delay: index * 0.15, 
              ease: [0.4, 0, 0.2, 1]
            }}
            className={`relative p-8 rounded-2xl border transition-all duration-300 ease-in-out shadow-lg ${
              plan.featured 
                ? 'bg-gradient-to-br from-[#00f5a0] to-[#00d9ff] ring-2 ring-[#00f5a0] shadow-[#00f5a0]/30' 
                : 'border-[#00f5a0]/30 bg-[#030712] hover:border-[#00f5a0] hover:shadow-[#00f5a0]/20'
            } text-white`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-white text-[#00f5a0] px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                  Most Popular
                </span>
              </div>
            )}
            <div className="mt-4">
              <h3 className={`text-2xl font-bold mb-2 ${plan.featured ? 'text-white' : 'text-white'}`}>{plan.title}</h3>
              <div className="mb-6">
                <span className={`text-5xl font-extrabold ${plan.featured ? 'text-white' : 'bg-gradient-to-r from-[#00f5a0] to-[#00d9ff] bg-clip-text text-transparent'}`}>
                  {plan.price}
                </span>
                <span className={`text-sm ml-2 ${plan.featured ? 'text-white/80' : 'text-gray-400'}`}>
                  {plan.period}
                </span>
              </div>
              <ul className={`space-y-3 mb-8 text-left ${plan.featured ? 'text-white' : 'text-gray-200'}`}>
                {plan.features.map(f => (
                  <li key={f} className="flex items-start">
                    <span className={`mr-3 mt-1 ${plan.featured ? 'text-white' : 'text-[#00f5a0]'}`}>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </span>
                    <span className="leading-relaxed">{f}</span>
                  </li>
                ))}
              </ul>
              <Link to="/events">
                <Button className={`w-full font-semibold py-3 ${
                  plan.featured 
                    ? 'bg-white text-[#00f5a0] hover:bg-gray-100 shadow-lg' 
                    : 'bg-gradient-to-r from-[#00f5a0] to-[#00d9ff] hover:from-[#00d9ff] hover:to-[#00f5a0]'
                }`}>
                  Buy Tickets
                </Button>
              </Link>
            </div>
          </motion.div>
        ))}
        </div>
      </div>
    </section>
  );
}

