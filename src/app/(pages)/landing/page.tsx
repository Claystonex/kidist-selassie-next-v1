"use client"

import { useUser } from "@clerk/nextjs"
import React from 'react'

const LandingPage = () => {
  const { user } = useUser();
  return (
    <div>Welcome {user?.firstName}</div>
  )
}

export default LandingPage;