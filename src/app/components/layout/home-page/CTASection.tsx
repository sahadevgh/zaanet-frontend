import Link from 'next/link'
import { Button } from '@/app/components/ui/button'

const CTASection = () => {
  return (
    <section className="py-20 bg-blue-900 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Join the Internet Sharing Revolution</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Be part of the movement to make internet accessible to everyone in Ghana and beyond.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button 
          className="px-8 py-6 font-medium"
          variant="default"
          >
            <Link href="/browse">Find WiFi</Link>
          </Button>
          <Button variant="outline" 
          className="px-8 py-6">
            <Link href="/host-network">Become a Host</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CTASection
