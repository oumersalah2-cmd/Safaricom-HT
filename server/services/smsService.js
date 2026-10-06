import { db } from './db.js';

export const smsService = {
  normalizePhone(phone) {
    if (!phone) return '';
    const clean = phone.replace(/\D/g, '');
    if (clean.startsWith('251')) return clean;
    if (clean.startsWith('0')) return '251' + clean.slice(1);
    if (clean.startsWith('7')) return '251' + clean;
    return clean;
  },

  formatDisplayPhone(phone) {
    const norm = this.normalizePhone(phone);
    if (norm.startsWith('251') && norm.length === 12) {
      return `0${norm.slice(3, 5)} ${norm.slice(5, 8)} ${norm.slice(8)}`;
    }
    return phone;
  },

  sendSms({ phone, body, sender = 'M-PESA' }) {
    const newSms = {
      id: "sms-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      phone: this.formatDisplayPhone(phone),
      normalizedPhone: this.normalizePhone(phone),
      sender,
      time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      body
    };

    db.update(data => {
      data.sms_notifications = [newSms, ...(data.sms_notifications || [])];
      return data;
    });

    return newSms;
  },

  getSmsForPhone(phone) {
    const norm = this.normalizePhone(phone);
    const notifications = db.get('sms_notifications') || [];
    return notifications.filter(n => {
      const itemNorm = this.normalizePhone(n.phone);
      return itemNorm === norm;
    });
  }
};
