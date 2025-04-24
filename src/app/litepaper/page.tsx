import Header from '@/app/components/layout/Header'
import React from 'react'
import Litepaper from '../components/layout/litepaper-page/Litepaper'
import Footer from '@/app/components/layout/Footer'

function page() {
  return (
    <div>
        <Header />
        <Litepaper />
        {/* <Footer /> */}
        <Footer />
    </div>
  )
}

export default page