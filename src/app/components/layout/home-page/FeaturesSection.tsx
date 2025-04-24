import { Wifi, Globe, Shield, Coins } from 'lucide-react'

const features = [
  {
    icon: <Wifi className="text-zaanet-purple w-6 h-6" />,
    bg: 'bg-zaanet-purple-light',
    title: 'List Your WiFi',
    description: 'Share your internet connection with those who need it most while keeping your network secure.',
  },
  {
    icon: <Globe className="text-amber-600 w-6 h-6" />,
    bg: 'bg-zaanet-yellow',
    title: 'Connect Easily',
    description: 'Find available networks nearby, connect with a few taps, and get online instantly.',
  },
  {
    icon: <Shield className="text-green-600 w-6 h-6" />,
    bg: 'bg-zaanet-green',
    title: 'Secure & Private',
    description: 'All connections are secured through blockchain technology, ensuring privacy for hosts and users.',
  },
  {
    icon: <Coins className="text-orange-600 w-6 h-6" />,
    bg: 'bg-zaanet-peach',
    title: 'Earn Crypto',
    description: 'Hosts earn USDT when users connect to their WiFi, with instant payouts to your wallet.',
  },
]

const FeaturesSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">How ZaaNet Works</h2>
          <p className="text-gray-600 max-w-xl mx-auto">Share your WiFi. Earn crypto. Help your community get connected.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-14 h-14 ${feature.bg} rounded-full flex items-center justify-center mb-6`}>
                {feature.icon}
              </div>
              <h3 className="font-heading font-semibold text-lg mb-3">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturesSection
