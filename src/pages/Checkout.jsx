import React, { useState, useEffect } from 'react';
import './Checkout.css';
import { useCart } from '../hooks/useCart.js';
import { useFormValidator } from '../hooks/useFormValidator.js';
import { useAuth } from '../hooks/useAuth.js';
import { useFlash } from '../hooks/useFlash.js';
import { money } from '../utils/currency.js';
import { AnimatePresence } from 'framer-motion';

// Uvoz novih komponenti
import OrderConfirmationModal from '../components/checkout/OrderConfirmationModal';
import DeliveryForm from '../components/checkout/DeliveryForm';
import ShippingSection from '../components/checkout/ShippingSection';
import PaymentSection from '../components/checkout/PaymentSection';
import OrderSummary from '../components/checkout/OrderSummary';

export default function Checkout() {
  const { items, total, dispatch } = useCart();
  const { user, register } = useAuth();
  const { flash } = useFlash();

  // --- STANJA ---
  const [payMethod, setPayMethod] = useState('cod');
  const [shippingMethod, setShippingMethod] = useState('courier');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderData, setOrderData] = useState(null);

  const [submitCount, setSubmitCount] = useState(0);
  const [showRegPopover, setShowRegPopover] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');
  const [popoverDismissed, setPopoverDismissed] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // --- VALIDACIJA ---
  const { formData, errors, handleChange, handleBlur, validateAll } =
    useFormValidator({
      name: '',
      surname: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
    });

  // --- KONSTANTE ---
  const FREE_SHIPPING_LIMIT = 8000;
  const COURIER_COST = 380;
  const isFreeShipping = total >= FREE_SHIPPING_LIMIT;
  const finalShipping =
    shippingMethod === 'pickup' ? 0 : isFreeShipping ? 0 : COURIER_COST;
  const finalTotal = total + finalShipping;
  const requiredForCourier = shippingMethod === 'courier';

  // --- EFEKTI ---
  // Resetovanje adrese kod preuzimanja
  useEffect(() => {
    if (shippingMethod === 'pickup') {
      handleChange({ target: { name: 'address', value: '' } });
      handleChange({ target: { name: 'city', value: '' } });
      handleChange({ target: { name: 'postalCode', value: '' } });
    }
  }, [shippingMethod, handleChange]);

  // Okidanje resize-a za lenis/animacije
  useEffect(() => {
    const t = setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 400);
    return () => clearTimeout(t);
  }, [shippingMethod, createAccount, showRegPopover, errors]);

  // --- REGISTRACIJA ---
  const handleConfirmReg = async () => {
    if (!formData.name.trim() || !formData.surname.trim()) {
      flash('Nedostaju podaci', 'Unesite ime i prezime iznad.', 'error');
      return;
    }
    if (!formData.email && !formData.phone) {
      flash('Nedostaju podaci', 'Unesite email.', 'error');
      return;
    }
    if (password.length < 6) {
      flash('Greška', 'Lozinka mora imati min. 6 karaktera', 'error');
      return;
    }
    setIsRegistering(true);
    try {
      await register({
        identity: formData.email || formData.phone,
        password: password,
        name: `${formData.name} ${formData.surname}`,
      });
      flash('Uspeh', 'Nalog je kreiran.', 'success');
      setShowRegPopover(false);
      setPassword('');
    } catch (err) {
      console.error('Reg failed', err);
      let msg = 'Došlo je do greške.';
      if (err.code === 'auth/email-already-in-use') msg = 'Email je zauzet.';
      flash('Greška', msg, 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDismissReg = () => {
    setShowRegPopover(false);
    setPopoverDismissed(true);
    setPassword('');
  };

  // --- ZAVRŠETAK PORUDŽBINE ---
  const handlePlaceOrder = async () => {
    const fieldsToSkip =
      shippingMethod === 'pickup' ? ['address', 'city', 'postalCode'] : [];

    if (validateAll(fieldsToSkip)) {
      // Ako je korisnik hteo registraciju a nije ulogovan
      if (createAccount && !user && password) {
        try {
          await register({
            identity: formData.email,
            password: password,
            name: `${formData.name} ${formData.surname}`,
          });
        } catch (err) {
          /* ignore silent fail */
        }
      }
      const orderId = 'DAJA-' + Date.now().toString().slice(-6);
      const orderSummary = {
        id: orderId,
        customer: formData,
        items: items,
        subtotal: total,
        shippingCost: finalShipping,
        shippingMethod: shippingMethod,
        finalTotal: finalTotal,
        date: new Date().toLocaleDateString('sr-RS'),
      };
      setOrderData(orderSummary);
      setShowSuccessModal(true);
      dispatch({ type: 'CLEAR' });
    } else {
      setSubmitCount((prev) => prev + 1);
      setTimeout(() => {
        const firstError = document.querySelector('.input-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  };

  const preventFormSubmit = (e) => e.preventDefault();
  const getInputClass = (n) => (errors[n] ? 'input-error' : '');

  return (
    <div className="container checkout-page">
      <h1 className="checkout-title">Naplata i Isporuka</h1>
      <form className="checkout-layout" onSubmit={preventFormSubmit} noValidate>
        <div className="checkout-left">
          {/* 1. Forma za isporuku */}
          <DeliveryForm
            formData={formData}
            errors={errors}
            handleChange={handleChange}
            handleBlur={handleBlur}
            submitCount={submitCount}
            user={user}
            getInputClass={getInputClass}
            shippingMethod={shippingMethod}
            requiredForCourier={requiredForCourier}
            showSuccessModal={showSuccessModal}
            // Props za registraciju
            password={password}
            setPassword={setPassword}
            showRegPopover={showRegPopover}
            setShowRegPopover={setShowRegPopover}
            handleDismissReg={handleDismissReg}
            handleConfirmReg={handleConfirmReg}
            isRegistering={isRegistering}
            popoverDismissed={popoverDismissed}
            createAccount={createAccount}
          />

          {/* 2. Opcije dostave (i mapa) */}
          <ShippingSection
            shippingMethod={shippingMethod}
            setShippingMethod={setShippingMethod}
            isFreeShipping={isFreeShipping}
            COURIER_COST={COURIER_COST}
            money={money}
            finalShipping={finalShipping}
          />

          {/* 3. Način plaćanja */}
          <PaymentSection payMethod={payMethod} setPayMethod={setPayMethod} />
        </div>

        <div className="checkout-right">
          {/* Sidebar: Suma */}
          <OrderSummary
            total={total}
            shippingMethod={shippingMethod}
            finalShipping={finalShipping}
            finalTotal={finalTotal}
            handlePlaceOrder={handlePlaceOrder}
            money={money}
          />
        </div>
      </form>

      {/* Modal za uspeh */}
      <AnimatePresence>
        {showSuccessModal && orderData && (
          <OrderConfirmationModal
            order={orderData}
            money={money}
            onClose={() => setShowSuccessModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
