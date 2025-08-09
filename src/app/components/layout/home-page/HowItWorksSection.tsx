import { UserPlus, Wifi, CreditCard } from 'lucide-react'
import { Badge } from '../../ui/badge'

const steps = [
  {
    icon: UserPlus,
    title: 'Host Setup',
    description: 'Register your WiFi network on our platform and set your hourly rates. Our smart contracts handle the rest.',
    step: '01'
  },
  {
    icon: Wifi,
    title: 'Guest Connects',
    description: 'Guests discover your network, pay instantly with mobile money or card, and get secure internet access.',
    step: '02'
  },
  {
    icon: CreditCard,
    title: 'Payment & Access',
    description: 'Automatic payment processing and instant access granted. You earn money while guests get connected.',
    step: '03'
  }
]

export function HowItWorksSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-blue-600 text-blue-200">How It Works</Badge>
          <h2 className="text-3xl md:text-5xl font-bold text-cyan-500 mb-6">
            Simple. Secure. Profitable.
          </h2>
          <p className="text-xl text-blue-200 max-w-3xl mx-auto">
            Get started with ZaaNet in three easy steps and begin earning from your internet connection today.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div key={index} className="relative text-center">
                {/* Step Number */}
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                </div>

                {/* Icon */}
                <div className="mt-8 mb-6">
                  <div className="w-20 h-20 mx-auto bg-blue-600/10 rounded-2xl flex items-center justify-center">
                    <step.icon className="h-10 w-10 text-blue-600" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-semibold text-white mb-4">
                  {step.title}
                </h3>
                <p className="text-blue-200 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
