import { useState } from "react";
import { FORM_RULES } from "../data/validationRules";

export function useFormValidator(initialState) {
  const [formData, setFormData] = useState(initialState);
  const [errors, setErrors] = useState({});

  // Handler za promenu (kucanje)
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // Ako postoji greška, brišemo je čim korisnik krene da ispravlja
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handler za izlaz iz polja (onBlur) - Tada validiramo
  const handleBlur = (e) => {
    const { name, value } = e.target;
    validateField(name, value);
  };

  // Glavna funkcija za validaciju jednog polja
  const validateField = (name, value) => {
    const rule = FORM_RULES[name];
    
    if (rule) {
      // Ako je polje prazno, a required je (hendlovano HTML-om), ali ovde proveravamo format
      if (value && !rule.regex.test(value)) {
        setErrors((prev) => ({ ...prev, [name]: rule.message }));
        return false;
      }
    }
    return true;
  };

  // Validacija cele forme pre slanja
  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(formData).forEach((key) => {
      const rule = FORM_RULES[key];
      const value = formData[key];

      if (rule && value && !rule.regex.test(value)) {
        newErrors[key] = rule.message;
        isValid = false;
      }
      // Dodatna provera za prazna polja ako HTML required nije dovoljan
      if (!value && rule) {
         // newErrors[key] = "Ovo polje je obavezno.";
         // isValid = false;
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
    validateAll
  };
}