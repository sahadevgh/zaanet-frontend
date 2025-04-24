const steps = [
    {
      number: 1,
      title: 'Connect Your Wallet',
      description: 'Link your blockchain wallet to transact seamlessly on the ZaaNet platform.',
    },
    {
      number: 2,
      title: 'Share or Discover',
      description: 'List your WiFi as a host or discover available networks as a user.',
    },
    {
      number: 3,
      title: 'Connect & Earn',
      description: 'Pay for access as a user or earn crypto as a host, with fair and transparent pricing.',
    },
  ]
  
  const StepsSection = () => {
    return (
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4">Simple Steps to Get Started</h2>
            <p className="text-gray-600 max-w-xl mx-auto">Whether you&apos;re sharing or connecting, ZaaNet makes it easy.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="bg-white p-8 rounded-lg shadow-sm border border-gray-100 relative"
              >
                <div className="w-12 h-12 rounded-full bg-zaanet-purple text-white flex items-center justify-center font-bold absolute -top-6 left-8">
                  {step.number}
                </div>
                <h3 className="font-heading font-semibold text-xl mb-4 mt-6">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
  
  export default StepsSection
  