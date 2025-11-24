export const onlyDigits = (value: string) => value.replace(/\D/g, '');

export const maskCPF = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
};

export const formatDate = (isoDate: string) => {
  const date = new Date(isoDate);
  return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(date);
};
