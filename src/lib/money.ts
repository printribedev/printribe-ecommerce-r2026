/** All prices are integer paise. Format for display only at the edge. */
export function formatINR(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(paise / 100);
}

export const rupeesToPaise = (rupees: number) => Math.round(rupees * 100);
