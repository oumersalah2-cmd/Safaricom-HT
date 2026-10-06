// API client for Ethio Bucks Platform (Node.js Express Backend)
const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('ethio_bucks_token');
  const userId = localStorage.getItem('ethio_bucks_user_id');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (userId) {
    headers['x-user-id'] = userId;
  }
  return headers;
}

export const api = {
  // Auth API
  auth: {
    async sendOtp(phone, role = 'worker') {
      const res = await fetch(`${API_BASE}/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, role })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to send OTP');
      }
      return res.json();
    },

    async verifyOtp(phone, code, name, role = 'worker') {
      const res = await fetch(`${API_BASE}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code, name, role })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to verify OTP');
      }
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('ethio_bucks_token', data.token);
        localStorage.setItem('ethio_bucks_user_id', data.user.id);
        localStorage.setItem('ethio_bucks_user', JSON.stringify(data.user));
      }
      return data;
    },

    async getMe() {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getAuthHeader()
      });
      if (!res.ok) {
        return null;
      }
      return res.json();
    },

    async getDemoAccounts() {
      const res = await fetch(`${API_BASE}/auth/demo-accounts`);
      return res.json();
    },

    logout() {
      localStorage.removeItem('ethio_bucks_token');
      localStorage.removeItem('ethio_bucks_user_id');
      localStorage.removeItem('ethio_bucks_user');
    }
  },

  // Tasks API
  tasks: {
    async getTasks(params = {}) {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/tasks${query ? `?${query}` : ''}`, {
        headers: getAuthHeader()
      });
      return res.json();
    },

    async getTask(id) {
      const res = await fetch(`${API_BASE}/tasks/${id}`, {
        headers: getAuthHeader()
      });
      return res.json();
    },

    async createTask(taskData) {
      const res = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(taskData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create task');
      }
      return res.json();
    }
  },

  // Submissions API
  submissions: {
    async getSubmissions(params = {}) {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE}/submissions${query ? `?${query}` : ''}`, {
        headers: getAuthHeader()
      });
      return res.json();
    },

    async submitProof(submissionData) {
      const res = await fetch(`${API_BASE}/submissions`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(submissionData)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to submit proof');
      }
      return res.json();
    },

    async approve(id) {
      const res = await fetch(`${API_BASE}/submissions/${id}/approve`, {
        method: 'POST',
        headers: getAuthHeader()
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to approve submission');
      }
      return res.json();
    },

    async reject(id, reason) {
      const res = await fetch(`${API_BASE}/submissions/${id}/reject`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ reason })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to reject submission');
      }
      return res.json();
    }
  },

  // Wallet API
  wallet: {
    async getWallet(userId) {
      const url = userId ? `${API_BASE}/wallet/${userId}` : `${API_BASE}/wallet`;
      const res = await fetch(url, {
        headers: getAuthHeader()
      });
      return res.json();
    },

    async withdraw(amount, phone, workerId) {
      const res = await fetch(`${API_BASE}/wallet/withdraw`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify({ amount, phone, workerId })
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Withdrawal failed');
      }
      return res.json();
    }
  },

  // M-Pesa API
  mpesa: {
    async getLogs() {
      const res = await fetch(`${API_BASE}/mpesa/logs`, {
        headers: getAuthHeader()
      });
      return res.json();
    },

    async getSms(phone) {
      const url = phone ? `${API_BASE}/mpesa/sms?phone=${encodeURIComponent(phone)}` : `${API_BASE}/mpesa/sms`;
      const res = await fetch(url, {
        headers: getAuthHeader()
      });
      return res.json();
    },

    async initiateStkPush(data) {
      const res = await fetch(`${API_BASE}/mpesa/stkpush`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(data)
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'STK Push failed');
      }
      return res.json();
    }
  },

  // Analytics API
  analytics: {
    async getAnalytics() {
      const res = await fetch(`${API_BASE}/analytics`, {
        headers: getAuthHeader()
      });
      return res.json();
    }
  }
};
