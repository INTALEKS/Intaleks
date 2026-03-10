"use client";

import { useState } from "react";
import { Navbar, Footer } from "@/components/home";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Loader2 } from "lucide-react";
import { ApiClient } from "@/app/services/api";

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
          <p className="text-gray-600 mt-1">If you have any questions, contact us via email or the form below</p>
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

          {/* Contact Info */}
          <div>
            {/* Contact Info */}
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-semibold text-lg mb-4">Contact Info</h3>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Email</p>
                    <p className="text-gray-600">admin@intaleks.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
