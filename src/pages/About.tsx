import React from 'react';
import Card from '../components/ui/Card';

const About: React.FC = () => {
  const team = [
    {
      name: 'Sarah Johnson',
      role: 'CEO & Co-founder',
      image: 'https://i.pravatar.cc/300?img=1',
      bio: 'Former VP of Product at TechCorp, passionate about building tools that empower teams.',
    },
    {
      name: 'Michael Chen',
      role: 'CTO & Co-founder',
      image: 'https://i.pravatar.cc/300?img=2',
      bio: 'Previously led engineering at StartupX, focused on creating scalable solutions.',
    },
    {
      name: 'Emma Williams',
      role: 'Head of Design',
      image: 'https://i.pravatar.cc/300?img=3',
      bio: '10+ years of experience in UX/UI design, advocate for accessible interfaces.',
    },
    {
      name: 'James Miller',
      role: 'Head of Engineering',
      image: 'https://i.pravatar.cc/300?img=4',
      bio: 'Cloud architecture expert, previously at major tech companies.',
    },
  ];

  const timeline = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'Started with a mission to revolutionize team collaboration.',
    },
    {
      year: '2021',
      title: 'First Major Release',
      description: 'Launched our core platform with essential features.',
    },
    {
      year: '2022',
      title: 'Global Expansion',
      description: 'Opened offices in Europe and Asia to serve worldwide customers.',
    },
    {
      year: '2023',
      title: 'Enterprise Solutions',
      description: 'Introduced enterprise-grade features and security.',
    },
    {
      year: '2024',
      title: 'AI Integration',
      description: 'Launched AI-powered automation and insights.',
    },
  ];

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-indigo/20 to-primary-purple/20 backdrop-blur-xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-heading mb-6">
              Our <span className="text-gradient">Story</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We're building the future of work, empowering teams to achieve their full potential
              through innovative collaboration tools.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Statement */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Card variant="glass" className="p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold font-heading mb-6">Our Mission</h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            To transform how teams work together by creating intuitive, powerful tools that foster
            collaboration, enhance productivity, and bring ideas to life.
          </p>
        </Card>
      </div>

      {/* Timeline Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary-indigo/10 to-primary-purple/10 backdrop-blur-xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <h2 className="text-3xl font-bold font-heading mb-12 text-center">
            Our <span className="text-gradient">Journey</span>
          </h2>
          <div className="flex flex-col space-y-8">
            {timeline.map((item, index) => (
              <div
                key={item.year}
                className={`flex flex-col md:flex-row items-start gap-8 ${
                  index % 2 ? 'md:flex-row-reverse' : ''
                }`}
              >
                <div className="md:w-1/2 flex justify-end">
                  <Card
                    variant="glass"
                    className={`p-6 md:p-8 w-full md:max-w-md hover-lift ${
                      index % 2 ? 'md:text-right' : ''
                    }`}
                    hoverable
                  >
                    <div className="text-lg font-bold text-primary-indigo dark:text-primary-purple mb-2">
                      {item.year}
                    </div>
                    <h3 className="text-xl font-bold font-heading mb-2">{item.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                  </Card>
                </div>
                {index !== timeline.length - 1 && (
                  <div className="hidden md:block flex-1 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-px h-full bg-gradient-to-b from-primary-indigo to-primary-purple" />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-3xl font-bold font-heading mb-12 text-center">
          Meet Our <span className="text-gradient">Team</span>
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {team.map((member) => (
            <Card
              key={member.name}
              variant="glass"
              className="hover-lift"
              hoverable
            >
              <div className="aspect-w-1 aspect-h-1 relative overflow-hidden rounded-t-xl">
                <img
                  src={member.image}
                  alt={member.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold font-heading mb-1">{member.name}</h3>
                <div className="text-primary-indigo dark:text-primary-purple font-medium mb-3">
                  {member.role}
                </div>
                <p className="text-gray-600 dark:text-gray-300">{member.bio}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;