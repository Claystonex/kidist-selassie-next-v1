import Link from 'next/link';
import React from 'react'

const MentorshipPage = () => {
  return (
    <div className='text-white text-lg font-montserrat flex text-center justify-center items-center b-4 border-yellow-400'>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full px-4 ">
        {/* Feature Cards */}
        <FeatureCard 
          title="Clergy" 
          description="Connect with experienced mentors in faith and technology."
          link="/mentorship"
        />
        <FeatureCard 
          title="Deacons" 
          description="Share your prayers and pray for others in our global community."
          link="/prayer"
        />
        <FeatureCard 
          title="Arch-Deacons" 
          description="Witness and share stories of God's work in our community."
          link="/miracles"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full px-4 mt-8">
        {/* Feature Cards */}
        <FeatureCard 
          title="Post Your Funny Audio" 
          description="Share your short (clean) jokes and laugh with our community."
          link="/jokes"
        />
        <FeatureCard 
          title="Q&A" 
          description="Ask questions and get answers from our community."
          link="/questions"
        />
        <FeatureCard 
          title="Feedback &
          Comments" 
          description="Share your feedback and comments about the website."
          link="/feedback"
        />
      </div>
      <div className="border-t-4 w-[80wh] pb-4 border-[#c4142c]"></div>
      <div className="border-t-4 w-[50wh] border-[#c4142c]"></div>

    </div>
  );
}

function FeatureCard({ title, description, link }: { 
  title: string; 
  description: string; 
  link: string;
}) {
  return (
    <Link href={link}>
      <div className="bg-white/10 p-6 rounded-lg hover:bg-white/20 transition-colors">
        <h2 className="font-montserrat text-2xl mb-2">{title}</h2>
        <p className="text-gray-200">{description}</p>
      </div>
    </Link>
  );
      {/* <ul>
        <li>Clergy</li>
        <li>Deacons</li>
        <li>Arch-Deacons</li>
        <li>Tewahado Professionals</li>
        <li>Youth Leaders</li>
      </ul> */}
      
  //   </div>
  // )
}

export default MentorshipPage;  