import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/common/Button';
import Studentimage from  '../assets/images/student.png'
import {
  Briefcase,
  Users,
  Star,
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  Award,
  Globe,
  Search,
  DollarSign,
  Target,
  MessageCircle,
  ChevronRight,
  Play,
  Code,
  Palette,
  FileText,
  TrendingUpIcon,
  LayoutDashboard
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  // Get dashboard path based on user role
  const getDashboardPath = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'student':
        return '/student/dashboard';
      case 'client':
        return '/client/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/login';
    }
  };

  // SEO Meta Tags
  useEffect(() => {
    document.title = 'Freshlancer - Hire Talented Students & Find Freelance Jobs | #1 Student Freelance Platform';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'Connect with skilled student freelancers for your projects or find freelance jobs as a student. 10,000+ verified students, secure payments, and quality guaranteed. Join Freshlancer today!');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Connect with skilled student freelancers for your projects or find freelance jobs as a student. 10,000+ verified students, secure payments, and quality guaranteed. Join Freshlancer today!';
      document.head.appendChild(meta);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    const keywords = 'student freelancers, hire students, freelance jobs for students, student marketplace, freelance platform, find student talent, student jobs online, remote student work, hire freelance students, student gigs';
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'keywords';
      meta.content = keywords;
      document.head.appendChild(meta);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:title');
      meta.content = 'Freshlancer - Connect Students with Freelance Opportunities';
      document.head.appendChild(meta);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      const meta = document.createElement('meta');
      meta.setAttribute('property', 'og:description');
      meta.content = 'The premier platform connecting skilled students with clients worldwide. Find freelance work or hire top student talent.';
      document.head.appendChild(meta);
    }

    const twitterCard = document.querySelector('meta[name="twitter:card"]');
    if (!twitterCard) {
      const meta = document.createElement('meta');
      meta.name = 'twitter:card';
      meta.content = 'summary_large_image';
      document.head.appendChild(meta);
    }

    const canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = window.location.origin;
      document.head.appendChild(link);
    }

  }, []);

  const features = [
    {
      icon: <Code className="w-6 h-6" />,
      title: 'Quality Freelance Jobs',
      description: 'Access thousands of vetted freelance opportunities from verified clients across web development, design, writing, marketing, and more',
      keywords: 'freelance jobs, student jobs, online work',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Skilled Student Freelancers',
      description: 'Hire talented university students with fresh ideas and competitive rates for your projects in programming, graphic design, content creation',
      keywords: 'hire students, student talent, freelance students',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Payment Protection',
      description: 'Industry-leading secure payment system with escrow protection, verified profiles, and fraud prevention for safe transactions',
      keywords: 'secure payments, payment protection, safe freelancing',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Fast Hiring Process',
      description: 'Find and hire qualified student freelancers in under 24 hours with our streamlined matching algorithm and instant communication',
      keywords: 'quick hiring, fast recruitment, instant hire',
      gradient: 'from-orange-500 to-red-500'
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Top-Rated Platform',
      description: 'Trusted review and rating system with 95% client satisfaction rate, helping you choose the best freelancers for your needs',
      keywords: 'top rated, best freelance platform, trusted marketplace',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Career Growth Opportunities',
      description: 'Students build professional portfolios, gain real-world experience, and develop in-demand skills while earning money online',
      keywords: 'career growth, portfolio building, skill development',
      gradient: 'from-indigo-500 to-purple-500'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Verified Student Freelancers', icon: <Users className="w-8 h-8" /> },
    { number: '5,000+', label: 'Successful Projects Completed', icon: <CheckCircle className="w-8 h-8" /> },
    { number: '95%', label: 'Client Satisfaction Rate', icon: <Star className="w-8 h-8" /> },
    { number: '50+', label: 'Countries Worldwide', icon: <Globe className="w-8 h-8" /> }
  ];

  const benefits = {
    students: [
      'Apply to 100+ freelance jobs per month with Premium membership',
      'Get verified student badge to increase profile visibility by 300%',
      'Build professional portfolio with real client testimonials',
      'Flexible remote working hours that fit your study schedule',
      'Gain valuable real-world experience and industry skills',
      'Direct client communication and long-term project opportunities'
    ],
    clients: [
      'Access to 10,000+ verified student freelancers with diverse skills',
      'Post unlimited job listings in programming, design, marketing, writing',
      'Review detailed profiles, portfolios, and ratings before hiring',
      'Secure escrow payment system with money-back guarantee',
      'Average response time under 2 hours from qualified freelancers',
      'Quality guarantee with project milestone tracking'
    ]
  };

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Marketing Manager',
      company: 'Tech Startup Inc.',
      text: 'Found an amazing graphic design student who delivered exceptional work at a fraction of traditional agency costs.',
      rating: 5,
      avatar: 'SJ'
    },
    {
      name: 'Mohammed Ahmed',
      role: 'Computer Science Student',
      company: 'University Graduate',
      text: 'Earned over $5,000 in my first semester while building a professional portfolio. This platform changed my life!',
      rating: 5,
      avatar: 'MA'
    }
  ];

  const jobCategories = [
    { name: 'Web Development', icon: <Code className="w-5 h-5" />, color: 'bg-blue-500' },
    { name: 'Mobile App Development', icon: <Code className="w-5 h-5" />, color: 'bg-purple-500' },
    { name: 'Graphic Design', icon: <Palette className="w-5 h-5" />, color: 'bg-pink-500' },
    { name: 'UI/UX Design', icon: <Palette className="w-5 h-5" />, color: 'bg-indigo-500' },
    { name: 'Content Writing', icon: <FileText className="w-5 h-5" />, color: 'bg-green-500' },
    { name: 'Digital Marketing', icon: <TrendingUpIcon className="w-5 h-5" />, color: 'bg-orange-500' },
    { name: 'Academic Tasks', icon: <MessageCircle className="w-5 h-5" />, color: 'bg-cyan-500' },
    { name: 'Video Editing', icon: <Play className="w-5 h-5" />, color: 'bg-red-500' },
    { name: 'Data Entry', icon: <FileText className="w-5 h-5" />, color: 'bg-gray-500' },
    { name: 'Translation Services', icon: <Globe className="w-5 h-5" />, color: 'bg-teal-500' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Structured Data (Schema.org) */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Freshlancer",
          "alternateName": "Freshlancer Student Freelance Platform",
          "url": window.location.origin,
          "description": "Premier platform connecting skilled student freelancers with clients worldwide for remote work opportunities"
        })}
      </script>

      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Freshlancer",
          "url": window.location.origin,
          "logo": `${window.location.origin}/logo.png`,
          "description": "Leading student freelance marketplace connecting talented students with businesses worldwide"
        })}
      </script>

      {/* Modern Navigation Bar */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-lg bg-white/90" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Space - 180x50px recommended */}
            <div className="flex items-center">
              <div className="w-[180px] h-[50px] bg-gradient-to-r from-[#25aaad] to-[#156ba0] rounded-lg flex items-center justify-center">
                {/* Replace with actual logo image */}
                <Briefcase className="w-8 h-8 text-white" aria-hidden="true" />
                <span className="ml-2 text-2xl font-bold text-white">Freshlancer</span>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-[#25aaad] font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-[#25aaad] font-medium transition-colors">How It Works</a>
              <a href="#testimonials" className="text-gray-700 hover:text-[#25aaad] font-medium transition-colors">Testimonials</a>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <>
                  <span className="text-gray-700 font-medium">
                    Welcome, {user?.name}
                  </span>
                  <Button
                    onClick={() => navigate(getDashboardPath())}
                    aria-label="Go to your dashboard"
                    className="bg-gradient-to-r from-[#25aaad] to-[#156ba0] text-white hover:shadow-lg transition-all"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" aria-hidden="true" />
                    Go to Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/login')}
                    aria-label="Sign in to your account"
                    className="border-gray-300 text-gray-700 hover:border-[#25aaad] hover:text-[#25aaad]"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    aria-label="Create a free account"
                    className="bg-gradient-to-r from-[#25aaad] to-[#156ba0] text-white hover:shadow-lg transition-all"
                  >
                    Get Started Free
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Modern Asymmetric Design */}
      <header className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <article className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#25aaad]/10 to-[#156ba0]/10 rounded-full text-sm font-medium text-[#156ba0] border border-[#25aaad]/20">
                <Zap className="w-4 h-4" aria-hidden="true" />
                <span>Top-Rated Student Freelance Marketplace 2025</span>
              </div>

              <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Hire Talented
                <br />
                <span className="bg-gradient-to-r from-[#25aaad] to-[#156ba0] bg-clip-text text-transparent">
                  Student Freelancers
                </span>
              </h2>

              <p className="text-xl text-gray-600 leading-relaxed">
                Connect with skilled university students for your projects or discover freelance opportunities.
                Join 10,000+ students and businesses building success together.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Button
                    size="lg"
                    onClick={() => navigate(getDashboardPath())}
                    className="bg-gradient-to-r from-[#25aaad] to-[#156ba0] text-white hover:shadow-xl transition-all text-lg px-8 py-4"
                    aria-label="Go to your dashboard"
                  >
                    <LayoutDashboard className="w-5 h-5 mr-2" aria-hidden="true" />
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                  </Button>
                ) : (
                  <>
                    <Button
                      size="lg"
                      onClick={() => navigate('/register')}
                      className="bg-gradient-to-r from-[#25aaad] to-[#156ba0] text-white hover:shadow-xl transition-all text-lg px-8 py-4"
                      aria-label="Start finding freelance jobs or hiring students"
                    >
                      Start Now - 100% Free
                      <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/login')}
                      className="border-2 border-gray-300 text-gray-700 hover:border-[#25aaad] hover:text-[#25aaad] text-lg px-8 py-4"
                      aria-label="Sign in to existing account"
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </div>

              <div className="flex items-center gap-6 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <span className="text-sm text-gray-600">2-minute signup</span>
                </div>
              </div>
            </article>

            {/* Right Image Space - 600x500px recommended */}
            <div className="relative">
              <div className="w-full h-[500px] bg-gradient-to-br from-[#25aaad]/10 to-[#156ba0]/10 rounded-3xl flex items-center justify-center border border-[#25aaad]/20 shadow-2xl">
                {/* Replace with actual hero image */}
                <div className="text-center space-y-4">
                  <Globe className="w-32 h-32 text-[#25aaad] mx-auto" />
                  <p className="text-gray-500 font-medium">Hero Image</p>
                  <p className="text-sm text-gray-400">Recommended: 600x500px</p>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-6 -right-6 w-32 h-32 bg-gradient-to-br from-[#25aaad] to-[#156ba0] rounded-3xl opacity-20 blur-2xl"></div>
              <div className="absolute -bottom-6 -left-6 w-40 h-40 bg-gradient-to-br from-[#156ba0] to-[#25aaad] rounded-3xl opacity-20 blur-2xl"></div>
            </div>
          </div>

          {/* Stats Section - Modern Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="text-[#25aaad] mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#25aaad] to-[#156ba0] bg-clip-text text-transparent mb-2">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Features Section - Modern Card Grid */}
      <section id="features" className="py-24 bg-white" aria-labelledby="features-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="features-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-[#25aaad] to-[#156ba0] bg-clip-text text-transparent">Freshlancer</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed in the student freelance marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <article
                key={index}
                className="group bg-white p-8 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-2xl transition-all duration-300"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Job Categories Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white" aria-labelledby="categories-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="categories-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Popular Freelance Categories
            </h2>
            <p className="text-xl text-gray-600">
              Find skilled freelancers or discover jobs in these in-demand categories
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {jobCategories.map((category, index) => (
              <div
                key={index}
                className="group bg-white p-6 rounded-xl border border-gray-100 hover:border-[#25aaad] hover:shadow-lg transition-all cursor-pointer"
              >
                <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-white mb-3 group-hover:scale-110 transition-transform`}>
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 group-hover:text-[#25aaad] transition-colors">
                  {category.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section - Dual Cards with Brand Colors */}
      <section className="py-24 bg-white" aria-labelledby="benefits-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="benefits-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-16 text-center">
            Benefits for Everyone
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* For Students Card */}
            <article className="relative bg-white rounded-3xl overflow-hidden border-2 border-[#25aaad]/20 hover:border-[#25aaad] transition-all shadow-xl hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#25aaad]/10 to-transparent rounded-full -mr-32 -mt-32"></div>

              <div className="relative p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#25aaad] to-[#1a8b8d] rounded-2xl flex items-center justify-center shadow-lg">
                    <Award className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">For Students</h3>
                    <p className="text-[#25aaad] font-medium">Launch your career</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-8 text-lg">
                  Gain experience, build portfolio, and earn money while studying
                </p>

                <ul className="space-y-4 mb-8">
                  {benefits.students.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#25aaad] mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Image Space for Students - 400x300px */}
                <div className="w-full h-[300px] bg-gradient-to-br from-[#25aaad]/10 to-[#25aaad]/5 rounded-2xl mb-6 flex items-center justify-center border border-[#25aaad]/20">
                  <div className="text-center space-y-2">
                    <Users className="w-20 h-20 text-[#25aaad] mx-auto" />
                    <p className="text-gray-500 font-medium">Student Image</p>
                    <p className="text-sm text-gray-400">400x300px</p>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-[#25aaad] to-[#1a8b8d] text-white hover:shadow-xl text-lg py-6"
                  onClick={() => navigate('/register')}
                  aria-label="Join as student freelancer"
                >
                  Join as Student Freelancer
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </article>

            {/* For Clients Card */}
            <article className="relative bg-white rounded-3xl overflow-hidden border-2 border-[#156ba0]/20 hover:border-[#156ba0] transition-all shadow-xl hover:shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#156ba0]/10 to-transparent rounded-full -mr-32 -mt-32"></div>

              <div className="relative p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#156ba0] to-[#0f4a6f] rounded-2xl flex items-center justify-center shadow-lg">
                    <Search className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">For Clients</h3>
                    <p className="text-[#156ba0] font-medium">Find top talent</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-8 text-lg">
                  Hire skilled students for quality work at competitive rates
                </p>

                <ul className="space-y-4 mb-8">
                  {benefits.clients.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#156ba0] mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Image Space for Clients - 400x300px */}
                <div className="w-full h-[300px] bg-gradient-to-br from-[#156ba0]/10 to-[#156ba0]/5 rounded-2xl mb-6 flex items-center justify-center border border-[#156ba0]/20">
                  <div className="text-center space-y-2">
                    <Briefcase className="w-20 h-20 text-[#156ba0] mx-auto" />
                    <p className="text-gray-500 font-medium">Client Image</p>
                    <p className="text-sm text-gray-400">400x300px</p>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-[#156ba0] to-[#0f4a6f] text-white hover:shadow-xl text-lg py-6"
                  onClick={() => navigate('/register')}
                  aria-label="Hire student talent"
                >
                  Hire Student Talent Today
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-gradient-to-br from-gray-50 to-white" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="testimonials-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-gray-600">
              Real results from students and clients on our platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <article
                key={index}
                className="bg-white p-8 rounded-2xl border border-gray-100 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" aria-hidden="true" />
                  ))}
                </div>

                <blockquote className="text-gray-700 text-lg mb-6 leading-relaxed">
                  "{testimonial.text}"
                </blockquote>

                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-[#25aaad] to-[#156ba0] rounded-full flex items-center justify-center text-white font-bold text-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                    <div className="text-sm text-gray-500">{testimonial.company}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-white" aria-labelledby="how-it-works-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="how-it-works-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection lines */}
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-1 bg-gradient-to-r from-[#25aaad] to-[#156ba0] -z-10"></div>

            <article className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#25aaad] to-[#156ba0] rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg">
                1
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Create Your Profile
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Sign up in 2 minutes with your skills, portfolio, and experience
              </p>
            </article>

            <article className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#25aaad] to-[#156ba0] rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg">
                2
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Browse & Connect
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Find jobs or talent, review profiles, and start conversations
              </p>
            </article>

            <article className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-[#25aaad] to-[#156ba0] rounded-2xl flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-lg">
                3
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Work & Succeed
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Complete projects with secure payments and build lasting success
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-white" aria-labelledby="faq-heading">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="faq-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-16 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: 'How much does it cost to use Freshlancer?',
                a: 'Creating an account is 100% free for both students and clients. Students can apply to 10 jobs per month on the free plan, or upgrade to Premium for $4.99/month to apply to 100 jobs. Clients can post unlimited jobs and only pay when they hire.'
              },
              {
                q: 'Are student freelancers on Freshlancer verified?',
                a: 'Yes! All student freelancers go through a verification process where they submit student ID and enrollment proof. Verified students get a badge on their profile, ensuring clients work with legitimate, talented university students.'
              },
              {
                q: 'What types of freelance jobs are available for students?',
                a: 'We have opportunities in web development, mobile apps, graphic design, UI/UX design, content writing, copywriting, digital marketing, SEO, social media management, video editing, data entry, translation, virtual assistant, and more.'
              },
              {
                q: 'How does payment protection work on Freshlancer?',
                a: 'We use secure escrow payment systems (Paymob for EGP, PayPal for USD) to protect both parties. Funds are held securely and released upon project completion, ensuring safe transactions for students and clients.'
              }
            ].map((faq, index) => (
              <article key={index} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {faq.q}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {faq.a}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-[#25aaad] to-[#156ba0] relative overflow-hidden" aria-labelledby="cta-heading">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mb-48"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Globe className="w-20 h-20 text-white mx-auto mb-8" aria-hidden="true" />
          <h2 id="cta-heading" className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-10 leading-relaxed">
            Join 10,000+ students and businesses finding success on Freshlancer.
            <br />
            Sign up free today - no credit card required!
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              className="bg-white text-[#156ba0] hover:bg-gray-50 hover:shadow-2xl text-lg px-10 py-6 font-semibold"
              aria-label="Create free account now"
            >
              Start Now - 100% Free
              <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login')}
              className="border-2 border-white text-white hover:bg-white/10 text-lg px-10 py-6 font-semibold"
              aria-label="Sign in to account"
            >
              Sign In to Account
            </Button>
          </div>
      
        </div>
      </section>

      {/* Modern Footer */}
      <footer className="bg-gray-900 text-gray-300 py-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="md:col-span-2">
              <div className="flex items-center mb-6">
                {/* Logo Space - 180x50px */}
                <div className="w-[180px] h-[50px] bg-gradient-to-r from-[#25aaad] to-[#156ba0] rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" aria-hidden="true" />
                  <span className="ml-2 text-xl font-bold text-white">Freshlancer</span>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                The leading student freelance marketplace connecting talented university students
                with businesses worldwide for remote work opportunities.
              </p>
              <div className="flex gap-4">
                <a href="https://facebook.com/freshlancer" aria-label="Facebook" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#25aaad] transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="https://twitter.com/freshlancer" aria-label="Twitter" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#25aaad] transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com/company/freshlancer" aria-label="LinkedIn" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#156ba0] transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* For Students */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">For Students</h3>
              <ul className="space-y-3">
                <li><a href="/register" className="text-gray-400 hover:text-[#25aaad] transition-colors">Find Jobs</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-[#25aaad] transition-colors">Build Portfolio</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-[#25aaad] transition-colors">Premium Plans</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-[#25aaad] transition-colors">Success Stories</a></li>
              </ul>
            </div>

            {/* For Clients */}
            <div>
              <h3 className="text-white font-bold mb-4 text-lg">For Clients</h3>
              <ul className="space-y-3">
                <li><a href="/register" className="text-gray-400 hover:text-[#156ba0] transition-colors">Post Jobs</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-[#156ba0] transition-colors">Find Talent</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-[#156ba0] transition-colors">Pricing</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-[#156ba0] transition-colors">How It Works</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <p className="text-center text-gray-500 text-sm">
              &copy; 2025 Freshlancer - Premier Student Freelance Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
