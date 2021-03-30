import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: string): string =>
  format(new Date(date), 'd MMM yyy', {
    locale: ptBR,
  });
