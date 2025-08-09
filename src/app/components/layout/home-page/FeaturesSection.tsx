import { DollarSign, Zap, Shield, Settings } from 'lucide-react'
import { Card, CardContent } from '../../ui/card'

const features = [
  {
    icon: DollarSign,
    title: 'Earn from Your WiFi',
    description: 'Transform your internet connection into a steady income stream. Set your rates and earn automatically from every guest connection.',
    color: 'text-green-500'
  },
  {
    icon: Zap,
    title: 'Fast & Secure Guest Access',
    description: 'Guests connect instantly with mobile money or card payments. No complicated setups or long registration processes.',
    color: 'text-blue-500'
  },
  {
    icon: Shield,
    title: 'Blockchain-Powered Transparency',
    description: 'All transactions are recorded on the blockchain for complete transparency and trust between hosts and guests.',
    color: 'text-purple-500'
  },
  {
    icon: Settings,
    title: 'Simple Plug-and-Play Setup',
    description: 'Get started in minutes with our easy setup process. No technical expertise required - just plug in and start earning.',
    color: 'text-[#00BFA6]'
  }
]

export function FeaturesSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-cyan-500 mb-6">
            Why Choose ZaaNet?
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            We're revolutionizing internet access with cutting-edge technology 
            that benefits both hosts and guests in the digital economy.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className="bg-blue-900 border-2 border-transparent hover:border-blue-600/20 transition-all duration-300 hover:shadow-lg group"
            >
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-16 h-16 mx-auto bg-blue-200 rounded-2xl flex items-center justify-center group-hover:bg-black/40 transition-colors">
                    <feature.icon className={`h-8 w-8 ${feature.color} group-hover:text-blue-600 transition-colors`} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-blue-200 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
