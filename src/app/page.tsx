// app/page.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useUser, SignInButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Zap,
  Bug,
  FileText,
  BarChart3,
  Mail,
  Palette,
  ArrowRight,
  Check,
  Github,
  ChevronDown,
  ChevronUp,
  UsersRound,
  UserRound,
  Building,
  ListTodoIcon
} from 'lucide-react'

export default function LandingPage() {
  const { isSignedIn } = useUser()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const features = [
    {
      icon: ListTodoIcon,
      title: 'Smart Todo Management',
      description: 'Organize your development tasks with AI-powered categorization and list generation.'
    },
    {
      icon: Bug,
      title: 'Bug Tracking & Reporting',
      description: 'Comprehensive bug reporting using AI, one click to scan code & report a bug.'
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Create & organize, one click to generate docs or sammurise.'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Get simple analytics for your software with multiple service support - Clerk, Supabase, Github.'
    },
    {
      icon: Mail,
      title: 'Email & Post Manager',
      description: 'Launch, Track & Sammurise emails & social media marketing posts directly from your development environment.'
    },
    {
      icon: Palette,
      title: 'Design & Flows',
      description: 'Create visual workflows and designs with our integrated Miro-like interface.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Senior Developer at TechCorp',
      content: 'AppPad transformed how our team manages development workflows. The AI features are game-changing!',
      avatar: '/avatars/sarah.jpg',
      rating: 5
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Founder, StartupLab',
      content: 'Finally, a tool that understands developers. The bug tracking and analytics saved us countless hours.',
      avatar: '/avatars/marcus.jpg',
      rating: 5
    },
    {
      name: 'Emily Watson',
      role: 'Product Manager at DevFlow',
      content: 'The email campaigns and content creation features are surprisingly powerful. Love the integration!',
      avatar: '/avatars/emily.jpg',
      rating: 5
    }
  ]

  const faqs = [
    {
      question: 'How does AppPad integrate with my existing workflow?',
      answer: 'AppPad is built with developers in mind. It integrates seamlessly with popular tools like GitHub, Slack, and your favorite IDEs through our comprehensive API and webhook system.'
    },
    {
      question: 'Can I migrate my existing data to AppPad?',
      answer: 'Absolutely! We provide migration tools and support for importing data from popular project management tools, bug trackers, and documentation platforms.'
    },
    {
      question: 'Is my data secure with AppPad?',
      answer: 'Security is our top priority. We use enterprise-grade encryption, regular security audits, and comply with industry standards like SOC 2 and GDPR.'
    },
    {
      question: 'What kind of support do you offer?',
      answer: 'We offer 24/7 email support for all users, priority support for Pro users, and comprehensive documentation with video tutorials.'
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer: 'Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees. Your data remains accessible during the billing period.'
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 h-[80vh]">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Badge variant="secondary" className="mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Now with AI-powered features
            </Badge>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 w-[650px] m-auto">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Save Time.
              </span>{' '}
              Build Better & Faster.
            </h1>
            <p className="text-xl text-foreground/70 mb-8 max-w-3xl mx-auto leading-relaxed">
              Stop juggling multiple tools. AppPad brings together everything you need to build,
              ship, and scale your projects — from smart todo management to advanced analytics.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isSignedIn ? (
                <Link href="/dashboard">
                  <Button size="xl" className="bg-gradient-to-r cursor-pointer text-white from-blue-600 to-purple-600 hover:from-blue-700 hover:to-cyan-500 text-lg px-8 py-3 transition-colors duration-300">
                    Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <SignInButton mode="modal">
                  <Button className="bg-gradient-to-r text-gray-100 cursor-pointer from-blue-600 to-purple-600 hover:to-blue-700 hover:from-purple-700 text-lg px-8 py-3 transition-colors duration-300" size="xl">
                    Start Building Today
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </SignInButton>
              )}
              <Link href="https://github.com/divyanshMauryaaa/app-pad">
                <Button variant="outline" size="xl" className="text-lg px-8 py-3 cursor-pointer">
                  <Github className="mr-2 w-5 h-5" />
                  Give a Star
                </Button>
              </Link>

            </div>
          </div>
        </div>
      </section>

      {/* Ideal For & Mission Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50/60 via-purple-50/60 to-cyan-50/60 dark:from-blue-950/40 dark:via-purple-950/40 dark:to-cyan-950/40 overflow-hidden animate-fadeIn">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-cyan-400/20 rounded-full blur-3xl -translate-x-1/2 -z-10" />
        </div>
        <div className="max-w-5xl mx-auto text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r dark:text-white from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-10 flex items-center justify-center gap-2 drop-shadow-lg">
            Specialized for
          </h2>
          <div className="flex gap-4 md:flex-row m-auto w-8xl">

            <Card className='w-[400px] h-[auto] text-start'>
              <CardHeader>
                <UsersRound size={50} />
                <CardTitle>Small dev teams</CardTitle>
                <CardDescription>
                  For small dev teams looking for a simple and easy to use tool to manage their projects.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className='w-[400px] h-[auto] text-start'>
              <CardHeader>
                <UserRound size={50} />
                <CardTitle>Solo developers & indie hackers</CardTitle>
                <CardDescription>
                  For software developers who want to spend more time writing code than opening 10000 tabs.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className='w-[400px] h-[auto] text-start'>
              <CardHeader>
                <Building size={50} />
                <CardTitle>Early Stage Startups</CardTitle>
                <CardDescription>
                  For early startups looking to reduce their managing cost, time & to focus on their core product.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className='w-[400px] h-[auto] text-start'>
              <CardHeader>
                <UsersRound size={50} />
                <CardTitle>Hackathon Teams</CardTitle>
                <CardDescription>
                  For Hackathon teams looking to build a MVP in a short amount of time.
                </CardDescription>
              </CardHeader>
            </Card>


          </div>
        </div>
        <div className="flex justify-center my-12">
          <span className="inline-block w-24 h-1 rounded-full bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 opacity-70" />
        </div>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-6 flex items-center justify-center gap-2 drop-shadow-lg">
            Our Mission is to...
          </h2>
          <p className="text-2xl text-foreground/80 mb-6 font-semibold">
            To empower developers and teams to build, ship, and scale projects faster by unifying essential tools—todo management, bug tracking, documentation, analytics, and more—into a single, AI-powered platform.
          </p>
          <p className="text-lg text-foreground/70">
            We believe developers should focus on building, not on tool overload. That’s why we built an all-in-one platform that solves real, everyday problems for modern software creators.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need, nothing you don't
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Built by developers, for developers. Every feature is designed to solve real problems
              you face every day.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-background/60 backdrop-blur-sm"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: 'fadeInUp 0.6s ease-out forwards'
                }}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-foreground/70 mb-8">
              Choose the plan that scales with your ambitions
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-8xl mx-auto">
            <Card className="hover:shadow-xl transition-all duration-300 border-2">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">Codebase</CardTitle>
                <div className="text-4xl font-bold mb-2">
                  Free
                </div>
                <CardDescription>Codebase for your projects</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    'Limited AI Usage',
                    '10 Docs',
                    '10 Tasks & 3 Lists',
                    '3 Env Variables',
                    'Limited GitHub Context Usage in AI',
                    'No access to advanced features (AI Blogwriting, Customer Feedback AI Assistant, Emails & Post Manager, Analytics, Flows & Design, SEO Data Maker, Legal Docs Vault, Vibe-pricing maker)'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 cursor-pointer hover:from-purple-600 text-white hover:to-cyan-500 transition-colors duration-300">
                      Get Started
                    </Button>
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 cursor-pointer hover:from-purple-600 text-white hover:to-cyan-500 transition-colors duration-300">
                      Get Started
                    </Button>
                  </SignInButton>
                )}
              </CardContent>
            </Card>

            {/* Standard Plan */}
            <Card className="hover:shadow-xl transition-all duration-300 border-2 border-purple-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                  Most Popular
                </Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">Codebase Starter</CardTitle>
                <div className="text-4xl font-bold mb-2">
                  $8
                  <span className="text-lg font-normal text-foreground/60">
                    /month
                  </span>
                </div>
                <CardDescription>Best for Hackathons, Freelancers, MVP teams</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {[
                    'Unlimited AI Usage',
                    'Unlimited Docs',
                    'Unlimited Tasks & Lists',
                    'Unlimited Env Variables',
                    'Development, Production, Staging Env Support',
                    'GitHub Context Usage in AI'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 cursor-pointer hover:from-purple-600 text-white hover:to-cyan-500 transition-colors duration-300">
                      Get Started
                    </Button>
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 cursor-pointer hover:from-purple-600 text-white hover:to-cyan-500 transition-colors duration-300">
                      Get Started
                    </Button>
                  </SignInButton>
                )}
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="hover:shadow-xl transition-all duration-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl mb-2">Business</CardTitle>
                <div className="text-4xl font-bold mb-2">
                  $20
                  <span className="text-lg font-normal text-foreground/60">
                    /month
                  </span>
                </div>
                <CardDescription>Perfect for early-stage startups looking to scale</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <p className="text-sm text-foreground/70 mb-3">Everything in Standard, plus:</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {[
                    'Full Access to AI Blogwriting',
                    'Full Access to Customer Feedback AI Assistant',
                    'Full Access to Emails & Post Manager',
                    'Full Access to AppPad APIs',
                    'Full Access to Analytics',
                    'Full Access to Flows & Design',
                    'SEO Data Maker',
                    'Legal Docs Vault',
                    'Vibe-pricing maker'
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                {isSignedIn ? (
                  <Link href="/dashboard">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 cursor-pointer hover:from-purple-600 text-white hover:to-cyan-500 transition-colors duration-300">
                      Get Started
                    </Button>
                  </Link>
                ) : (
                  <SignInButton mode="modal">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 cursor-pointer hover:from-purple-600 text-white hover:to-cyan-500 transition-colors duration-300">
                      Get Started
                    </Button>
                  </SignInButton>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {/* <section className="py-20 px-4 sm:px-6 lg:px-8 bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Loved by developers worldwide
            </h2>
            <p className="text-xl text-foreground/70">
              Join thousands of developers who've streamlined their workflow with AppPad
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-background/60 backdrop-blur-sm border-0">
                <CardContent className="pt-6">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-foreground/80 mb-6 leading-relaxed">
                    "{testimonial.content}"
                  </p>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white font-semibold">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-foreground/60">{testimonial.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section> */}

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Frequently asked questions
            </h2>
            <p className="text-xl text-foreground/70">
              Everything you need to know about AppPad
            </p>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <Card key={index} className="border">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg text-left">{faq.question}</CardTitle>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-foreground/60" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-foreground/60" />
                    )}
                  </div>
                </CardHeader>
                {openFaq === index && (
                  <CardContent>
                    <p className="text-foreground/70 leading-relaxed">{faq.answer}</p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to supercharge your development workflow?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of developers who've already made the switch to AppPad.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isSignedIn ? (
              <Link href="/dashboard">
                <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3">
                  Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            ) : (
              <>
                <SignInButton mode="modal">
                  <Button size="lg" className="bg-white text-purple-600 hover:bg-gray-100 text-lg px-8 py-3">
                    Start Free Today
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </SignInButton>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-purple-600 text-lg px-8 py-3"
                >
                  View Documentation
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-background border-t">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <Link href="/" className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-foreground">AppPad</span>
              </Link>
              <p className="text-foreground/70 mb-4 max-w-md">
                The all-in-one developer platform that streamlines your workflow,
                boosts productivity, and helps you ship better code faster.
              </p>
              <div className="flex space-x-4">
                <Link href="https://github.com/divyanshMauryaaa/app-pad" className="text-foreground/60 hover:text-foreground">
                  <Github className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-foreground/70 hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-foreground/70 hover:text-foreground">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="text-foreground/70 hover:text-foreground">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/api" className="text-foreground/70 hover:text-foreground">
                    API Reference
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/help" className="text-foreground/70 hover:text-foreground">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-foreground/70 hover:text-foreground">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/status" className="text-foreground/70 hover:text-foreground">
                    System Status
                  </Link>
                </li>
                <li>
                  <Link href="/community" className="text-foreground/70 hover:text-foreground">
                    Community
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-foreground/60 text-sm">
              © 2025 AppPad. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-foreground/60 hover:text-foreground text-sm">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-foreground/60 hover:text-foreground text-sm">
                Terms of Service
              </Link>
              <Link href="/cookies" className="text-foreground/60 hover:text-foreground text-sm">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeInUp 1.2s cubic-bezier(0.23, 1, 0.32, 1);
        }
      `}</style>
    </div>
  )
}