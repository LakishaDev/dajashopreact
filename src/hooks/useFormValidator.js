import { useState } from 'react';
import { FORM_RULES } from '../data/validationRules';

export function useFormValidator(initialState) {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  // Handler za promenu (kucanje)
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Brišemo grešku čim korisnik krene da kuca
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handler za onBlur (validacija pojedinačnog polja)
  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  const validateField = (name, value) => {
    const rule = FORM_RULES[name];
    if (rule) {
      // 1. Ako vrednost postoji, proveri Regex
      if (value && !rule.regex.test(value)) {
        setErrors((prev) => ({ ...prev, [name]: rule.message }));
        return false;
      }
      // (Ovde ne proveravamo prazno polje na onBlur da ne bi smarali korisnika pre vremena)
    }
    return true;
  };

  // --- GLAVNA VALIDACIJA NA DUGME ---
  // Prima listu polja koja treba preskočiti (npr. ['address', 'city'] za Pickup)
  const validateAll = (fieldsToSkip = []) => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      // Ako je polje u listi za preskakanje, ignoriši ga
      if (fieldsToSkip.includes(key)) return;

      const rule = FORM_RULES[key];
      const value = formData[key];

      // 1. Provera REGEX-a (ako je uneto nešto)
      if (rule && value && !rule.regex.test(value)) {
        newErrors[key] = rule.message;
        isValid = false;
      }

      // 2. PROVERA PRAZNIH POLJA (Ovo je falilo!)
      // Ako nema vrednosti, a postoji pravilo -> OBAVEZNO JE
      if (!value && rule) {
        newErrors[key] = 'Ovo polje je obavezno.';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  return {
    formData,
    errors,
    handleChange,
    handleBlur,
    validateAll,
  };
}
