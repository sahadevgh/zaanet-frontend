import Header from '@/components/layout/Header'
import React from 'react'
import Footer from '@/components/layout/Footer'
import BecomeAHostPage from '../../components/layout/become-host-page/BecomeAHostPage'

function page() {
  return (
    <div>
        <Header />
        <BecomeAHostPage />
        {/* <Footer /> */}
        <Footer />
    </div>
  )
}

export default page