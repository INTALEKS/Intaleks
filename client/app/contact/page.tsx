"use client";

import { useState } from "react";
import { Navbar, Footer } from "@/components/home";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, Loader2 } from "lucide-react";
import { ApiClient } from "@/app/services/api";

const offices = [
  {
    city: "PERTH OFFICE",
    address: "Level 25, 1 Spring Street,\nCapital Square Tower 3,\nPerth, 6000",
    phone: "(08) 6144 4723",
  },
  {
    city: "SYDNEY OFFICE",
    address: "Level 35, 100 Barangaroo\nAve. Sydney NSW 2000",
    phone: "(02) 8088 0798",
  },
  {
    city: "MELBOURNE OFFICE",
    address: "Level 27, 101 Collins\nStreet, Melbourne VIC\n3000",
    phone: "(03) 7046 1243",
  },
  {
    city: "BRISBANE OFFICE",
    address: "Level 29, 97 Creek St,\nBrisbane City QLD 4000",
    phone: "(07) 3535 1238",
  },
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await ApiClient.submitContact(formData.name, formData.email, formData.message);
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-2">Get In Touch</h1>

        <div className="mt-8">
          <h2 className="text-xl font-semibold">Available 24/7</h2>
          <p className="text-gray-600 mt-1">If you have any questions, contact us via email, text, phone, or the form below</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mt-8">
          {/* Contact Form */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h3 className="font-semibold text-lg mb-4">Send a Message</h3>

            {submitted ? (
              <div className="text-green-600 py-8 text-center">Thank you! Your message has been sent successfully.</div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Name</label>
                  <Input placeholder="Enter your name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Email</label>
                  <Input type="email" placeholder="Enter your email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>

                <div>
                  <label className="block text-sm text-gray-600 mb-1">Your message</label>
                  <Textarea placeholder="Enter your message" rows={5} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required />
                </div>

                <Button type="submit" className="bg-blue-500 hover:bg-blue-600" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            )}
          </div>

          {/* Contact Info & Offices */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Contact Info</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Phone</p>
                    <p className="text-gray-600">0466 805 568</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">admin@intaleks.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Offices */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Visit Our Offices</h3>

              <div className="grid grid-cols-2 gap-6">
                {offices.map((office) => (
                  <div key={office.city}>
                    <h4 className="font-semibold text-sm mb-2">{office.city}</h4>
                    <p className="text-gray-600 text-sm whitespace-pre-line">{office.address}</p>
                    <p className="text-gray-600 text-sm mt-1">{office.phone}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="mt-12 rounded-xl overflow-hidden h-[400px]">
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7083017.789693877!2d134.35493855!3d-25.274398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2b2bfd076787c5df%3A0x538267a1955b1352!2sAustralia!5e0!3m2!1sen!2sus!4v1704067200000!5m2!1sen!2sus" width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
