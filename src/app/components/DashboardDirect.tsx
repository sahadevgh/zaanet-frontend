import React from 'react'
import { Button } from './ui/button';
import Link from 'next/link';

function DashboardDirect({ roleType }: { roleType: string }) {
  return (
    <div>
      <Link href={`/${roleType}/dashboard`}>
      <Button 
      variant="default"
      >
        Visit Dashboard
      </Button>
      </Link>
     
    </div>
  )
}

export default DashboardDirect;