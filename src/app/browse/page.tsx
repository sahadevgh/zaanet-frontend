import React from "react";
import Header from "@/app/components/layout/Header";
import Footer from "@/app/components/layout/Footer";
import BrowseNetworksPage from "@/app/components/layout/browse-page/BrowseNetworksPage";


export default function Page() {

  return (
   <>
   <Header />
   <BrowseNetworksPage />
   <Footer />
   </>
  );
}