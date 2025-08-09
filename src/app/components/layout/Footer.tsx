import Link from 'next/link'
import { Wifi, Facebook, Twitter, Linkedin, Mail } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-slate-950 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-[#00BFA6] rounded-lg flex items-center justify-center">
                <Wifi className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">ZaaNet</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Turning every WiFi into an income stream. Join the decentralized revolution 
              that's connecting communities and creating opportunities across Africa.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-[#00BFA6] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#00BFA6] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#00BFA6] transition-colors">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#00BFA6] transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-[#00BFA6] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-300 hover:text-[#00BFA6] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-300 hover:text-[#00BFA6] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/dashboard/host" className="text-gray-300 hover:text-[#00BFA6] transition-colors">
                  Become a Host
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="#" className="text-gray-300 hover:text-[#00BFA6] transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-[#00BFA6] transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-[#00BFA6] transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-300 hover:text-[#00BFA6] transition-colors">
                  Support
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © {new Date().getFullYear()} ZaaNet. All rights reserved. Built with ❤️.
          </p>
        </div>
      </div>
    </footer>
  )
}
