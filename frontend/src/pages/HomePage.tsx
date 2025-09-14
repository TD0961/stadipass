import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { 
  Ticket, 
  Calendar, 
  Shield, 
  Smartphone,
  ArrowRight
} from 'lucide-react'

export const HomePage = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="container">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="heading-1 mb-6">
              Your Gateway to 
              <span className="text-primary-600"> Unforgettable Events</span>
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              Experience the thrill of live events with StadiPass. Secure, convenient, 
              and seamless ticket purchasing for stadiums and venues worldwide.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/events">
                <Button size="lg" className="w-full sm:w-auto">
                  Browse Events
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="heading-2 mb-4">Why Choose StadiPass?</h2>
            <p className="text-body max-w-2xl mx-auto">
              We make event ticketing simple, secure, and accessible for everyone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card variant="hover" className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <Ticket className="h-6 w-6 text-primary-600" />
                </div>
                <CardTitle>Instant Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Get your tickets instantly with secure QR codes delivered to your device.
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant="hover" className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-secondary-600" />
                </div>
                <CardTitle>Secure & Safe</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Bank-level security with encrypted transactions and fraud protection.
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant="hover" className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-accent-600" />
                </div>
                <CardTitle>Mobile First</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Optimized for mobile devices with easy ticket management and entry.
                </CardDescription>
              </CardContent>
            </Card>

            <Card variant="hover" className="text-center">
              <CardHeader>
                <div className="mx-auto w-12 h-12 bg-success-100 rounded-lg flex items-center justify-center mb-4">
                  <Calendar className="h-6 w-6 text-success-600" />
                </div>
                <CardTitle>Easy Booking</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Simple booking process with real-time availability and instant confirmation.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section bg-neutral-900 text-white">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary-400 mb-2">10K+</div>
              <div className="text-neutral-400">Happy Customers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-secondary-400 mb-2">500+</div>
              <div className="text-neutral-400">Events Hosted</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-accent-400 mb-2">50+</div>
              <div className="text-neutral-400">Partner Stadiums</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success-400 mb-2">99.9%</div>
              <div className="text-neutral-400">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section">
        <div className="container">
          <Card className="text-center max-w-4xl mx-auto bg-gradient-to-r from-primary-500 to-secondary-500 text-white">
            <CardHeader>
              <CardTitle className="text-3xl mb-4">Ready to Experience Live Events?</CardTitle>
              <CardDescription className="text-primary-100 text-lg">
                Join thousands of event-goers who trust StadiPass for their ticket needs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/events">
                  <Button variant="outline" size="lg" className="bg-white text-primary-600 hover:bg-neutral-50">
                    Browse Events
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="ghost" size="lg" className="text-white border-white hover:bg-white/10">
                    Create Account
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
