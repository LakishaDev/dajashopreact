// 2. Helper za novac
export const formatMoney = (amount: number) => {
  return new Intl.NumberFormat("sr-RS", {
    style: "currency",
    currency: "RSD",
    minimumFractionDigits: 0,
  }).format(amount);
};
