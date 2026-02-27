import { Mail, MessageSquare, Instagram, Linkedin, MessageCircle, Send } from 'lucide-react';
import { useState } from 'react';

export function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the data to your backend
    setSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="mb-6">Get in Touch</h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Have questions, suggestions, or want to partner with us? We'd love to hear from you!
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm">
            <h2 className="text-gray-900 mb-6">Send us a Message</h2>
            
            {submitted && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-xl">
                ✓ Thank you for your message! We'll get back to you soon.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl outline-none focus:border-blue-500 transition-colors resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all"
              >
                <Send className="w-5 h-5" />
                <span>Send Message</span>
              </button>
            </form>
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            {/* Email */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-2">Email Us</h3>
                  <p className="text-gray-600 mb-2">Send us an email anytime</p>
                  <a href="mailto:info@learn-org.com" className="text-blue-600 hover:text-blue-700">
                    info@learn-org.com
                  </a>
                </div>
              </div>
            </div>

            {/* General Inquiries */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-gray-900 mb-2">General Inquiries</h3>
                  <p className="text-gray-600">
                    For general questions about Opportunities Kenya, partnership opportunities, or feedback.
                  </p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
              <h3 className="text-gray-900 mb-4">Connect on Social Media</h3>
              <p className="text-gray-600 mb-6">
                Follow us for daily updates on new opportunities
              </p>
              <div className="flex gap-4">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-4 bg-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Instagram className="w-5 h-5 text-pink-600" />
                  <span className="text-gray-700">Instagram</span>
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 p-4 bg-white rounded-xl hover:shadow-lg transition-all"
                >
                  <Linkedin className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">LinkedIn</span>
                </a>
              </div>
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 p-4 bg-white rounded-xl hover:shadow-lg transition-all"
              >
                <MessageCircle className="w-5 h-5 text-green-600" />
                <span className="text-gray-700">WhatsApp</span>
              </a>
            </div>

            {/* Quick Response */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border-l-4 border-blue-600">
              <h3 className="text-gray-900 mb-2">Quick Response Time</h3>
              <p className="text-gray-600">
                We typically respond to all inquiries within 24-48 hours during business days.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 bg-white rounded-2xl p-8 shadow-sm">
          <h2 className="text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-gray-900 mb-2">How do I apply for opportunities?</h3>
              <p className="text-gray-600">
                Click on any opportunity to view details, then click "Apply on Official Website" to be redirected to the organization's application page.
              </p>
            </div>
            <div>
              <h3 className="text-gray-900 mb-2">Is Opportunities Kenya free to use?</h3>
              <p className="text-gray-600">
                Yes! All our services are completely free. We believe in equal access to opportunities for everyone.
              </p>
            </div>
            <div>
              <h3 className="text-gray-900 mb-2">How often are opportunities updated?</h3>
              <p className="text-gray-600">
                We update our platform daily with new opportunities from verified organizations worldwide.
              </p>
            </div>
            <div>
              <h3 className="text-gray-900 mb-2">Can I submit an opportunity?</h3>
              <p className="text-gray-600">
                Yes! If you know of a legitimate opportunity, please contact us and our team will review and add it if it meets our criteria.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
