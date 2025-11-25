import React from 'react'
import Header from '../components/Header'
import Banner from '../components/Banner'
import Information from '../components/Information'
import LittleGuide from '../components/Littleguide'
import Footer from '../components/Footer'

export default function Home() {
  return (
    <>
      <Header />
      <div className="px-4 sm:px-6 md:px-8 py-8">
        <Banner />
      </div>
      <Information />
      <LittleGuide />
      <div className="h-px bg-linear-to-r from-transparent via-blue-400/50 to-transparent"></div>
      <Footer />
    </>
  )
}
