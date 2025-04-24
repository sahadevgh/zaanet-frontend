import Link from 'next/link'
import { Button } from '@/app/components/ui/button'

const CTASection = () => {
  return (
    <section className="py-20 bg-zaanet-purple text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-heading mb-6">Join the Internet Sharing Revolution</h2>
        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          Be part of the movement to make internet accessible to everyone in Ghana and beyond.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button className="bg-white text-zaanet-purple hover:text-white hover:border-zaanet-purple-light hover:border hover:bg-zaanet-purple-dark px-8 py-6 font-medium">
            <Link href="/browse">Find WiFi</Link>
          </Button>
          <Button variant="outline" className="bg-zaanet-purple dark:bg-zaanet-purple-dark border-white text-white hover:bg-white hover:text-zaanet-purple px-8 py-6 font-medium">
            <Link href="/host">Become a Host</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

export default CTASection
