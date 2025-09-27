'use client';

import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, ArrowUp } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', email);
    setEmail('');
  };

  const footerSections = [
    {
      title: 'Tautan Cepat',
      links: [
        { label: 'Beranda', href: '/' },
        { label: 'Toko', href: '/shop' },
        { label: 'Kategori', href: '/categories' },
        { label: 'Tentang Kami', href: '/about' },
        { label: 'Kontak', href: '/contact' },
      ],
    },
    {
      title: 'Layanan Pelanggan',
      links: [
        { label: 'Pusat Bantuan', href: '/help' },
        { label: 'Pengembalian', href: '/returns' },
        { label: 'Info Pengiriman', href: '/shipping' },
        { label: 'Panduan Ukuran', href: '/size-guide' },
        { label: 'Lacak Pesanan', href: '/track' },
      ],
    },
    {
      title: 'Perusahaan',
      links: [
        { label: 'Tentang Kami', href: '/about' },
        { label: 'Karier', href: '/careers' },
        { label: 'Pers', href: '/press' },
        { label: 'Kebijakan Privasi', href: '/privacy' },
        { label: 'Syarat Layanan', href: '/terms' },
      ],
    },
  ];

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  ];

  return (
    <footer className="bg-neutral-900 dark:bg-dark-950 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 lg:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold mb-4">UniMerch</h3>
              <p className="text-neutral-300 dark:text-neutral-400 text-sm leading-relaxed">
                Platform terpercaya untuk berbelanja merchandise universitas berkualitas dengan harga terjangkau. 
                Kami menghadirkan produk-produk terbaik dengan layanan pelanggan yang luar biasa.
              </p>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="space-y-3"
            >
              <div className="flex items-center space-x-3 text-sm text-neutral-300 dark:text-neutral-400">
                <MapPin className="w-4 h-4 flex-shrink-0" />
                <span>Semarang, Jawa Tengah, Indonesia</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-neutral-300 dark:text-neutral-400">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <span>+62 24 8508082</span>
              </div>
              <div className="flex items-center space-x-3 text-sm text-neutral-300 dark:text-neutral-400">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <span>info@unimerch.com</span>
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold mb-3">Ikuti Kami</h4>
              <div className="flex space-x-3">
                {socialLinks.map((social) => {
                  const Icon = social.icon;
                  return (
                    <motion.a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-neutral-800 dark:bg-dark-800 rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                      aria-label={social.label}
                    >
                      <Icon className="w-4 h-4" />
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * (sectionIndex + 1) }}
              viewport={{ once: true }}
            >
              <h4 className="font-semibold text-lg mb-4">{section.title}</h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <motion.a
                      href={link.href}
                      className="text-neutral-300 dark:text-neutral-400 hover:text-white transition-colors text-sm"
                      whileHover={{ x: 5 }}
                    >
                      {link.label}
                    </motion.a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}

          {/* Newsletter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            viewport={{ once: true }}
            className="lg:col-span-1"
          >
            <h4 className="font-semibold text-lg mb-4">Newsletter</h4>
            <p className="text-neutral-300 dark:text-neutral-400 text-sm mb-4">
              Berlangganan untuk mendapatkan update produk terbaru dan penawaran khusus.
            </p>
            <form onSubmit={handleNewsletterSubmit} className="space-y-3">
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email Anda"
                  className="w-full px-4 py-3 bg-neutral-800 dark:bg-dark-800 border border-neutral-700 dark:border-dark-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-600 dark:focus:ring-primary-400 focus:border-transparent text-white placeholder-neutral-400 dark:placeholder-neutral-500"
                  required
                  aria-label="Alamat email untuk newsletter"
                />
              </div>
              <motion.button
                type="submit"
                className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-md font-medium transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Berlangganan
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-neutral-800 dark:border-dark-700">
        <div className="container mx-auto px-4 lg:px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="text-neutral-400 dark:text-neutral-500 text-sm"
            >
              © 2025 UniMerch. Hak cipta dilindungi.
            </motion.p>
            
            <div className="flex items-center space-x-6">
              <motion.a
                href="/privacy"
                className="text-neutral-400 dark:text-neutral-500 hover:text-white text-sm transition-colors"
                whileHover={{ y: -1 }}
              >
                Kebijakan Privasi
              </motion.a>
              <motion.a
                href="/terms"
                className="text-neutral-400 dark:text-neutral-500 hover:text-white text-sm transition-colors"
                whileHover={{ y: -1 }}
              >
                Syarat Layanan
              </motion.a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg flex items-center justify-center transition-colors z-50"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1, y: -2 }}
        whileTap={{ scale: 0.9 }}
        aria-label="Gulir ke atas"
      >
        <ArrowUp className="w-5 h-5" />
      </motion.button>
    </footer>
  );
}
