import React, { useState, useEffect } from 'react';
import './Checkout.css';
import { useCart } from '../hooks/useCart.js';
import { useFormValidator } from '../hooks/useFormValidator.js';
import { useAuth } from '../hooks/useAuth.js';
import { useFlash } from '../hooks/useFlash.js';
import { money } from '../utils/currency.js';
import { AnimatePresence } from 'framer-motion';

// --- FIREBASE IMPORTI ---
import { db } from '../services/firebase';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';

// Uvoz komponenti
import OrderConfirmationModal from '../components/checkout/OrderConfirmationModal';
import DeliveryForm from '../components/checkout/DeliveryForm';
import ShippingSection from '../components/checkout/ShippingSection';
import PaymentSection from '../components/checkout/PaymentSection';
import OrderSummary from '../components/checkout/OrderSummary';

// Helper za generisanje ID-a (DAJA-7cifara)
const generateOrderId = () => {
  const random7Digits = Math.floor(1000000 + Math.random() * 9000000);
  return `DAJA-${random7Digits}`;
};

export default function Checkout() {
  const { items, total, dispatch } = useCart();
  const { user, register } = useAuth();
  const { flash } = useFlash();

  const [payMethod, setPayMethod] = useState('cod');
  const [shippingMethod, setShippingMethod] = useState('courier');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // Novo stanje za loading

  const [submitCount, setSubmitCount] = useState(0);
  const [showRegPopover, setShowRegPopover] = useState(false);
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');
  const [popoverDismissed, setPopoverDismissed] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const {
    formData,
    errors,
    handleChange,
    handleBlur,
    validateAll,
    setFormData,
  } = useFormValidator({
    name: '',
    surname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  const FREE_SHIPPING_LIMIT = 8000;
  const COURIER_COST = 380;
  const isFreeShipping = total >= FREE_SHIPPING_LIMIT;
  const finalShipping =
    shippingMethod === 'pickup' ? 0 : isFreeShipping ? 0 : COURIER_COST;
  const finalTotal = total + finalShipping;
  const requiredForCourier = shippingMethod === 'courier';

  // --- AUTOFILL EFEKAT ---
  useEffect(() => {
    const fetchLastAddress = async () => {
      if (user && !formData.address && !formData.phone) {
        try {
          const q = query(
            collection(db, 'users', user.uid, 'addresses'),
            orderBy('createdAt', 'desc'),
            limit(1)
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const savedAddr = snapshot.docs[0].data();
            const parts = (savedAddr.name || '').trim().split(/\s+/);
            const fName = parts[0] || '';
            const lName = parts.slice(1).join(' ') || '';

            setFormData((prev) => ({
              ...prev,
              name: fName,
              surname: lName,
              email: user.email || prev.email,
              phone: savedAddr.phone || '',
              address: savedAddr.address || '',
              city: savedAddr.city || '',
              postalCode: savedAddr.zip || '',
            }));
          } else {
            setFormData((prev) => ({ ...prev, email: user.email || '' }));
          }
        } catch (error) {
          console.error(error);
        }
      }
    };
    fetchLastAddress();
  }, [user, setFormData]);

  useEffect(() => {
    if (shippingMethod === 'pickup') {
      setFormData((prev) => ({
        ...prev,
        address: '',
        city: '',
        postalCode: '',
      }));
    }
  }, [shippingMethod, setFormData]);

  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 400);
    return () => clearTimeout(t);
  }, [shippingMethod, createAccount, showRegPopover, errors]);

  const handleConfirmReg = async () => {
    // ... (logika registracije ostaje ista)
    if (!formData.name.trim() || !formData.surname.trim()) {
      flash('Greška', 'Unesite ime i prezime.', 'error');
      return;
    }
    if (!formData.email && !formData.phone) {
      flash('Greška', 'Unesite email.', 'error');
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
      flash('Uspeh', 'Nalog kreiran.', 'success');
      setShowRegPopover(false);
      setPassword('');
    } catch (err) {
      flash('Greška', 'Došlo je do greške pri registraciji.', 'error');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDismissReg = () => {
    setShowRegPopover(false);
    setPopoverDismissed(true);
    setPassword('');
  };

  // --- GLAVNA FUNKCIJA ZA SLANJE PORUDŽBINE ---
  const handlePlaceOrder = async () => {
    const fieldsToSkip =
      shippingMethod === 'pickup' ? ['address', 'city', 'postalCode'] : [];

    if (validateAll(fieldsToSkip)) {
      setIsProcessing(true);

      // 1. Opciona registracija
      if (createAccount && !user && password) {
        try {
          await register({
            identity: formData.email,
            password: password,
            name: `${formData.name} ${formData.surname}`,
          });
        } catch (err) {
          console.warn('Auto-reg failed', err);
        }
      }

      // 2. Kreiranje objekta porudžbine
      const orderId = generateOrderId();
      const newOrder = {
        id: orderId, // String ID (DAJA-XXXXXXX)
        customer: {
          ...formData,
          uid: user ? user.uid : 'guest', // Povezujemo sa korisnikom ako je ulogovan
        },
        items: items,
        subtotal: total,
        shippingCost: finalShipping,
        shippingMethod: shippingMethod,
        paymentMethod: payMethod,
        finalTotal: finalTotal,
        status: 'Na čekanju', // Inicijalni status
        isRead: false,
        date: new Date().toLocaleDateString('sr-RS'),
        createdAt: serverTimestamp(), // Za sortiranje u bazi
      };

      try {
        // 3. Upis u Firestore
        await addDoc(collection(db, 'orders'), newOrder);

        setOrderData(newOrder);
        setShowSuccessModal(true);
        dispatch({ type: 'CLEAR' });
      } catch (error) {
        console.error('Greška pri slanju porudžbine:', error);
        flash(
          'Greška',
          'Nismo uspeli da sačuvamo porudžbinu. Pokušajte ponovo.',
          'error'
        );
      } finally {
        setIsProcessing(false);
      }
    } else {
      setSubmitCount((prev) => prev + 1);
      setTimeout(() => {
        const firstError = document.querySelector('.input-error');
        if (firstError)
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
          <DeliveryForm
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            handleChange={handleChange}
            handleBlur={handleBlur}
            submitCount={submitCount}
            user={user}
            getInputClass={getInputClass}
            shippingMethod={shippingMethod}
            requiredForCourier={requiredForCourier}
            showSuccessModal={showSuccessModal}
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
          <ShippingSection
            shippingMethod={shippingMethod}
            setShippingMethod={setShippingMethod}
            isFreeShipping={isFreeShipping}
            COURIER_COST={COURIER_COST}
            money={money}
            finalShipping={finalShipping}
          />
          <PaymentSection payMethod={payMethod} setPayMethod={setPayMethod} />
        </div>

        <div className="checkout-right">
          <OrderSummary
            total={total}
            shippingMethod={shippingMethod}
            finalShipping={finalShipping}
            finalTotal={finalTotal}
            handlePlaceOrder={handlePlaceOrder}
            money={money}
            isLoading={isProcessing} // Možeš dodati spinner u dugme
          />
        </div>
      </form>

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
