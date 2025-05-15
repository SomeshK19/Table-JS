import moment from 'moment';

export const formatDate = (value: string, format: string) => {
  return moment(value).format(format);
};