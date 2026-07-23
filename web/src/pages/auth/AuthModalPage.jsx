import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import OTPLoginModal from '@/components/auth/OTPLoginModal.jsx';
import Header from '@/components/layout/Header.jsx';
import Footer from '@/components/layout/Footer.jsx';

export default function AuthModalPage() {
  const [open, setOpen] = useState(true);
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const redirect = params.get('redirect');

  const handleClose = () => {
    setOpen(false);
    setTimeout(() => navigate(redirect || '/'), 50);
  };

  return (
    <>
      <Header />
      <div className="min-h-[60vh]" />
      <Footer />
      <OTPLoginModal isOpen={open} onClose={handleClose} />
    </>
  );
}