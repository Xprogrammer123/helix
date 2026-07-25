import Image from 'next/image'
import React from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { DashboardSquare03FreeIcons, Settings03FreeIcons, WebhookFreeIcons } from '@hugeicons/core-free-icons'
import Link from 'next/link'

const Sidebar = () => {
  return (
      <div className='w-72 pr-3 h-full'>
          <div className="flex justify-between items-center w-full">
              <Image src="/logo.png" alt="Logo" width={1000} height={1000} className='h-auto w-17' />
              {/* <Hugeicons */}
          </div>
          <div className="flex flex-col w-full mt-10 gap-2">
              <Link href="/app" className="flex gap-2 items-center p-2 cursor-pointer px-3 rounded-xl text-white bg-linear-to-r from-[#252525] to-[#171717]">
                  <HugeiconsIcon icon={DashboardSquare03FreeIcons} className="size-4.5 text-white" strokeWidth={2.0} />
                  <p className="text-white font-medium text-[15px]">Overview</p>
              </Link>
              <Link href="/app/tunnels" className="flex gap-2 items-center p-2 cursor-pointer px-3 rounded-xl text-white">
                  <HugeiconsIcon icon={WebhookFreeIcons} className="size-4.5 text-white" strokeWidth={2.0} />
                  <p className="text-white font-medium text-[15px]">Tunnels</p>
              </Link>
              <Link href="/app/settings" className="flex gap-2 items-center p-2 cursor-pointer px-3 rounded-xl text-white">
                  <HugeiconsIcon icon={Settings03FreeIcons} className="size-4.5 text-white" strokeWidth={2.0} />
                  <p className="text-white font-medium text-[15px]">Settings</p>
              </Link>
            </div>
    </div>
  )
}

export default Sidebar