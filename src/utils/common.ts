export const getCurrentDecimalSeparator = () => {
  const n = 1.1;
  const sep = n.toLocaleString().substring(1, 2);
  return sep;
};
