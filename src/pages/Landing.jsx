import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Button from '../components/common/Button';
import { contactService } from '../services/contactService';
import Alert from '../components/common/Alert';
import Studentimage from  '../assets/images/student.png'
import Clientimage from  '../assets/images/client.png'
import logo from '../assets/logos/01.png';
import heroLogo from '../assets/logos/02.png';
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
  LayoutDashboard,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Send
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [contactFormError, setContactFormError] = useState('');
  const [contactFormSuccess, setContactFormSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      color: 'bg-blue-600'
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Skilled Student Freelancers',
      description: 'Hire talented university students with fresh ideas and competitive rates for your projects in programming, graphic design, content creation',
      keywords: 'hire students, student talent, freelance students',
      color: 'bg-[#25aaad]'
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure Payment Protection',
      description: 'Industry-leading secure payment system with escrow protection, verified profiles, and fraud prevention for safe transactions',
      keywords: 'secure payments, payment protection, safe freelancing',
      color: 'bg-green-600'
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: 'Fast Hiring Process',
      description: 'Find and hire qualified student freelancers in under 24 hours with our streamlined matching algorithm and instant communication',
      keywords: 'quick hiring, fast recruitment, instant hire',
      color: 'bg-orange-600'
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: 'Top-Rated Platform',
      description: 'Trusted review and rating system with 95% client satisfaction rate, helping you choose the best freelancers for your needs',
      keywords: 'top rated, best freelance platform, trusted marketplace',
      color: 'bg-yellow-600'
    },
    {
      icon: <TrendingUp className="w-6 h-6" />,
      title: 'Career Growth Opportunities',
      description: 'Students build professional portfolios, gain real-world experience, and develop in-demand skills while earning money online',
      keywords: 'career growth, portfolio building, skill development',
      color: 'bg-indigo-600'
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
      'Get verified student badge to increase profile visibility',
      'Build professional portfolio with real client testimonials',
      'Flexible remote working hours that fit your study schedule',
      'Gain valuable real-world experience and industry skills in early stages of your career',
      'Direct client communication and long-term project opportunities'
    ],
    clients: [
      'Access to world wide verified student freelancers with diverse skills',
      'Post unlimited job listings in programming, design, marketing, writing',
      'Review detailed profiles, portfolios, and ratings before hiring',
      'Secure escrow payment system with secure payment gateways',
      'Average response time from qualified freelancers',
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
    { name: 'Digital Marketing', icon: <TrendingUp className="w-5 h-5" />, color: 'bg-orange-500' },
    { name: 'Academic Tasks', icon: <MessageCircle className="w-5 h-5" />, color: 'bg-cyan-500' },
    { name: 'Video Editing', icon: <Play className="w-5 h-5" />, color: 'bg-red-500' },
    { name: 'Data Entry', icon: <FileText className="w-5 h-5" />, color: 'bg-gray-500' },
    { name: 'Translation Services', icon: <Globe className="w-5 h-5" />, color: 'bg-teal-500' },
  ];

  // Smooth scroll handler for anchor links
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const href = e.target.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const element = document.querySelector(href);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    };

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', handleAnchorClick);
    });

    return () => {
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.removeEventListener('click', handleAnchorClick);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ scrollBehavior: 'smooth' }}>
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

      {/* Professional Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo Space - Recommended size: 150px width × 50px height */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img
                  src={logo}
                  alt="Freshlancer logo"
                  className="h-[50px] w-auto max-w-[150px] object-contain"
                />
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-700 hover:text-[#065084] font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-700 hover:text-[#065084] font-medium transition-colors">How It Works</a>
              <a href="#about" className="text-gray-700 hover:text-[#065084] font-medium transition-colors">About Us</a>
              <a href="#contact" className="text-gray-700 hover:text-[#065084] font-medium transition-colors">Contact</a>
              <a href="#testimonials" className="text-gray-700 hover:text-[#065084] font-medium transition-colors">Testimonials</a>
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
                    className="bg-[#065084] text-white hover:bg-[#043d6b] transition-all"
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
                    className="border-gray-300 text-gray-700 hover:border-[#065084] hover:text-[#065084]"
                  >
                    Sign In
                  </Button>
                  <Button
                    onClick={() => navigate('/register')}
                    aria-label="Create a free account"
                    className="bg-[#065084] text-white hover:bg-[#043d6b] transition-all"
                  >
                    Get Started Free
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Professional Design */}
      <header className="relative overflow-hidden bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <article className="space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#065084]/10 rounded-md text-sm font-medium text-[#065084] border border-[#065084]/20">
                <Zap className="w-4 h-4" aria-hidden="true" />
                <span>Top-Rated Student Freelance Marketplace 2025</span>
              </div>

              <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Hire Talented
                <br />
                <span className="text-[#065084] font-extrabold" style={{ fontWeight: 900 }}>
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
                    className="bg-[#065084] text-white hover:bg-[#043d6b] transition-all text-lg px-8 py-4"
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
                      className="bg-[#065084] text-white hover:bg-[#043d6b] transition-all text-lg px-8 py-4"
                      aria-label="Start finding freelance jobs or hiring students"
                    >
                      Start Now - 100% Free
                      <ArrowRight className="w-5 h-5 ml-2" aria-hidden="true" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => navigate('/login')}
                      className="border-2 border-gray-300 text-gray-700 hover:border-[#065084] hover:text-[#065084] text-lg px-8 py-4"
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
              <div className="w-full h-[500px] bg-[#065084]/5 rounded-lg flex items-center justify-center border border-gray-200 shadow-lg overflow-hidden">
                <img
                  src={heroLogo}
                  alt="Freshlancer hero logo"
                  className="h-[400px] w-auto max-w-[500px] object-contain animate-bounce-slow"
                  style={{
                    animation: 'bounce-slow 2s ease-in-out infinite'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Stats Section - Modern Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-all"
              >
                <div className="text-[#065084] mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl lg:text-4xl font-bold text-[#065084] mb-2">
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
              Why Choose <span className="text-[#065084]">Freshlancer</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to succeed in the student freelance marketplace
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <article
                key={index}
                className="group bg-white p-8 rounded-lg border border-gray-200 hover:border-[#065084] hover:shadow-lg transition-all"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-lg flex items-center justify-center text-white mb-6 transition-transform`}>
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
      <section className="py-24 bg-gray-50" aria-labelledby="categories-heading">
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
                className="group bg-white p-6 rounded-lg border border-gray-200 hover:border-[#065084] hover:shadow-md transition-all cursor-pointer"
              >
                <div className={`w-10 h-10 ${category.color} rounded-lg flex items-center justify-center text-white mb-3 transition-transform`}>
                  {category.icon}
                </div>
                <h3 className="font-bold text-gray-900 group-hover:text-[#065084] transition-colors">
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
            <article className="relative bg-white rounded-lg overflow-hidden border-2 border-[#25aaad] hover:border-[#25aaad] transition-all shadow-lg hover:shadow-xl">
              <div className="relative p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#25aaad] rounded-lg flex items-center justify-center shadow-md">
                    <Award className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">For Students</h3>
                    <p className="text-[#25aaad] font-medium">Launch your career</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-8 text-lg">
                  Gain experience and earn money while studying
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
                <div className="w-full h-[300px] rounded-lg mb-6 overflow-hidden border border-[#25aaad]/30">
                  <img 
                    src={Studentimage} 
                    alt="Student freelancer working on projects" 
                    className="w-full h-full object-cover"
                  />
                </div>

                <Button
                  className="w-full bg-[#25aaad] text-white hover:bg-[#1a8b8d] text-lg py-6"
                  onClick={() => navigate('/register')}
                  aria-label="Join as student freelancer"
                >
                  Join as Student Freelancer
                  <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </article>

            {/* For Clients Card */}
            <article className="relative bg-white rounded-lg overflow-hidden border-2 border-[#065084] hover:border-[#065084] transition-all shadow-lg hover:shadow-xl">
              <div className="relative p-10">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-[#065084] rounded-lg flex items-center justify-center shadow-md">
                    <Search className="w-8 h-8 text-white" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900">For Clients</h3>
                    <p className="text-[#065084] font-medium">Find top talent</p>
                  </div>
                </div>

                <p className="text-gray-600 mb-8 text-lg">
                  Hire skilled students for quality work at competitive rates
                </p>

                <ul className="space-y-4 mb-8">
                  {benefits.clients.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-[#065084] mt-0.5 flex-shrink-0" aria-hidden="true" />
                      <span className="text-gray-700">{benefit}</span>
                    </li>
                  ))}
                </ul>

                {/* Image Space for Clients - 400x300px */}
                <div className="w-full h-[300px] rounded-lg mb-6 overflow-hidden border border-[#065084]/30">
                  <img 
                    src={Clientimage} 
                    alt="Client hiring student freelancers" 
                    className="w-full h-full object-cover"
                  />
                </div>

                <Button
                  className="w-full bg-[#065084] text-white hover:bg-[#043d6b] text-lg py-6"
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
      <section id="testimonials" className="py-24 bg-gray-50" aria-labelledby="testimonials-heading">
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
                className="bg-white p-8 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-all"
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
                  <div className="w-14 h-14 bg-[#065084] rounded-full flex items-center justify-center text-white font-bold text-lg">
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
            <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-1 bg-gray-300 -z-10"></div>

            <article className="text-center">
              <div className="w-20 h-20 bg-[#065084] rounded-lg flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-md">
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
              <div className="w-20 h-20 bg-[#065084] rounded-lg flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-md">
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
              <div className="w-20 h-20 bg-[#065084] rounded-lg flex items-center justify-center text-white text-3xl font-bold mx-auto mb-6 shadow-md">
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

      {/* About Us Section */}
      <section id="about" className="py-24 bg-white" aria-labelledby="about-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="about-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              About <span className="text-[#065084]">Freshlancer</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Empowering students and businesses to connect, collaborate, and succeed together
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Freshlancer is dedicated to bridging the gap between talented university students and businesses seeking quality freelance work. We believe that students bring fresh perspectives, innovative ideas, and competitive rates to the marketplace.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                Our platform provides a secure, verified environment where students can build their professional portfolios while earning income, and businesses can access top-tier talent at affordable rates.
              </p>
              <div className="flex gap-4 mt-8">
                <a href="https://facebook.com/freshlancer" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-12 h-12 bg-[#065084] rounded-lg flex items-center justify-center text-white hover:bg-[#043d6b] transition-colors">
                  <Facebook className="w-6 h-6" />
                </a>
                <a href="https://twitter.com/freshlancer" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-12 h-12 bg-[#065084] rounded-lg flex items-center justify-center text-white hover:bg-[#043d6b] transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="https://linkedin.com/company/freshlancer" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-12 h-12 bg-[#065084] rounded-lg flex items-center justify-center text-white hover:bg-[#043d6b] transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="https://instagram.com/freshlancer" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-12 h-12 bg-[#065084] rounded-lg flex items-center justify-center text-white hover:bg-[#043d6b] transition-colors">
                  <Instagram className="w-6 h-6" />
                </a>
              </div>
            </div>
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-3">Verified Students</h4>
                <p className="text-gray-600">Our platform hosts thousands of verified student freelancers from universities worldwide, each with unique skills and fresh perspectives.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-3">Secure Payment System</h4>
                <p className="text-gray-600">We use industry-leading escrow protection to ensure safe transactions for both students and clients, with money-back guarantees.</p>
              </div>
              <div className="p-6 bg-gray-50 rounded-lg">
                <h4 className="text-xl font-bold text-gray-900 mb-3">Market competitive prices</h4>
                <p className="text-gray-600">We offer competitive rates for students, allowing you to earn more while learning and building your portfolio.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section id="contact" className="py-24 bg-gray-50" aria-labelledby="contact-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 id="contact-heading" className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Contact <span className="text-[#065084]">Us</span>
            </h2>
            <p className="text-xl text-gray-600">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#065084] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Email</h4>
                    <a href="mailto:support@freshlancer.com" className="text-gray-600 hover:text-[#065084] transition-colors">
                      support@freshlancer.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#065084] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Phone</h4>
                    <a href="tel:+1234567890" className="text-gray-600 hover:text-[#065084] transition-colors">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-[#065084] rounded-lg flex items-center justify-center text-white flex-shrink-0">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">Address</h4>
                    <p className="text-gray-600">
                      123 Business Street<br />
                      City, State 12345<br />
                      Country
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <h4 className="font-bold text-gray-900 mb-4">Follow Us</h4>
                <div className="flex gap-4">
                  <a href="https://facebook.com/freshlancer" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700 hover:bg-[#065084] hover:text-white transition-colors">
                    <Facebook className="w-5 h-5" />
                  </a>
                  <a href="https://twitter.com/freshlancer" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700 hover:bg-[#065084] hover:text-white transition-colors">
                    <Twitter className="w-5 h-5" />
                  </a>
                  <a href="https://linkedin.com/company/freshlancer" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700 hover:bg-[#065084] hover:text-white transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                  <a href="https://instagram.com/freshlancer" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-700 hover:bg-[#065084] hover:text-white transition-colors">
                    <Instagram className="w-5 h-5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white p-8 rounded-lg shadow-lg">
              {contactFormError && (
                <Alert type="error" message={contactFormError} className="mb-4 contact-error-alert" onClose={() => setContactFormError('')} />
              )}
              {contactFormSuccess && (
                <Alert type="success" message={contactFormSuccess} className="mb-4 contact-success-alert" onClose={() => setContactFormSuccess('')} />
              )}
              <form
                className="space-y-6"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setContactFormError('');
                  setContactFormSuccess('');
                  setIsSubmitting(true);

                  try {
                    await contactService.createContact(contactFormData);
                    
                    // Clear form immediately
                    setContactFormData({
                      name: '',
                      email: '',
                      subject: '',
                      message: '',
                    });
                    
                    // Show success message
                    setContactFormSuccess('Thank you for your message! We will get back to you soon.');
                    
                    // Scroll to success message
                    setTimeout(() => {
                      const successAlert = document.querySelector('.contact-success-alert');
                      if (successAlert) {
                        successAlert.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    }, 100);
                  } catch (error) {
                    setContactFormError(
                      error.response?.data?.message ||
                      'Failed to send message. Please try again later.'
                    );
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
              >
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={contactFormData.name}
                    onChange={(e) =>
                      setContactFormData({ ...contactFormData, name: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065084] focus:border-transparent"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={contactFormData.email}
                    onChange={(e) =>
                      setContactFormData({ ...contactFormData, email: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065084] focus:border-transparent"
                    placeholder="your.email@example.com"
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-bold text-gray-700 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    required
                    value={contactFormData.subject}
                    onChange={(e) =>
                      setContactFormData({ ...contactFormData, subject: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065084] focus:border-transparent"
                    placeholder="What is this regarding?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-bold text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={6}
                    value={contactFormData.message}
                    onChange={(e) =>
                      setContactFormData({ ...contactFormData, message: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#065084] focus:border-transparent resize-none"
                    placeholder="Your message here..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#065084] text-white hover:bg-[#043d6b] text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-gray-50" aria-labelledby="faq-heading">
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
              <article key={index} className="bg-white p-8 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
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
      <section className="py-24 bg-[#065084] relative overflow-hidden" aria-labelledby="cta-heading">

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
              className="bg-white text-[#065084] hover:bg-gray-50 hover:shadow-2xl text-lg px-10 py-6 font-semibold"
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
                <div className="w-[180px] h-[50px] bg-[#065084] rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-white" aria-hidden="true" />
                  <span className="ml-2 text-xl font-bold text-white">Freshlancer</span>
                </div>
              </div>
              <p className="text-gray-400 mb-6 leading-relaxed">
                The leading student freelance marketplace connecting talented university students
                with businesses worldwide for remote work opportunities.
              </p>
              <div className="flex gap-4">
                <a href="https://facebook.com/freshlancer" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#25aaad] transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://twitter.com/freshlancer" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#25aaad] transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com/company/freshlancer" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#065084] transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://instagram.com/freshlancer" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#25aaad] transition-colors">
                  <Instagram className="w-5 h-5" />
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
                <li><a href="/register" className="text-gray-400 hover:text-[#065084] transition-colors">Post Jobs</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-[#065084] transition-colors">Find Talent</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-[#065084] transition-colors">Pricing</a></li>
                <li><a href="/register" className="text-gray-400 hover:text-[#065084] transition-colors">How It Works</a></li>
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
