import React, { useState } from 'react';
import { 
  Terminal, 
  Copy, 
  Check, 
  Code,
  Trash2
} from 'lucide-react';
import { sound } from '../utils/audio';

export function MpesaApiLogsModal({ logs, onClearLogs, onClose }) {
  const [selectedLog, setSelectedLog] = useState(logs[0] || null);
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    if (selectedLog) {
      navigator.clipboard.writeText(JSON.stringify(selectedLog, null, 2));
      setCopied(true);
      sound.playSuccess();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="api-logs-container glass-card animate-fade-in">
      <div className="api-logs-header">
        <div className="flex items-center gap-2">
          <Terminal size={22} className="text-green" />
          <div>
            <h3 className="text-lg font-bold">Safaricom Daraja 2.0 M-Pesa Sandbox Inspector</h3>
            <p className="text-xs text-muted">
              Live payload traces for STK Push Cash-in, Escrow Ledgers, and B2C Payout Callbacks
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="badge badge-green">
            <span className="safaricom-pulse"></span>
            Sandbox Node Active
          </span>
          {onClearLogs && (
            <button 
              className="btn btn-secondary btn-sm flex items-center gap-1" 
              onClick={() => {
                onClearLogs();
                setSelectedLog(null);
                sound.playKeypadBeep();
              }}
              title="Clear transaction logs"
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}
          {onClose && (
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Close Inspector</button>
          )}
        </div>
      </div>

      <div className="api-logs-body-grid">
        {/* Logs List Sidebar */}
        <div className="api-logs-sidebar">
          <div className="logs-sidebar-header">
            <span className="text-xs font-semibold text-muted">Recent Transactions ({logs.length})</span>
          </div>

          <div className="logs-list-scroll">
            {logs.map((log) => {
              const isStk = log.type.includes('STK');

              return (
                <button
                  key={log.id}
                  className={`log-item-btn ${selectedLog?.id === log.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedLog(log);
                    sound.playKeypadBeep();
                  }}
                >
                  <div className="log-item-top">
                    <span className={`log-badge ${isStk ? 'stk' : 'b2c'}`}>
                      {log.type}
                    </span>
                    <span className="log-time">{log.timestamp.split(' ')[1] || log.timestamp}</span>
                  </div>
                  <div className="log-item-desc">{log.details}</div>
                  <div className="log-item-footer">
                    <span className="text-xs font-semibold text-green">{log.amountETB?.toFixed(2)} ETB</span>
                    <span className="badge badge-sm badge-green">{log.status}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Log JSON Payload Inspector */}
        <div className="api-json-inspector">
          {selectedLog ? (
            <div className="json-card">
              <div className="json-card-top">
                <div className="flex items-center gap-2">
                  <Code size={16} className="text-muted" />
                  <span className="endpoint-tag">{selectedLog.endpoint}</span>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={handleCopyJson}>
                  {copied ? <Check size={14} className="text-green" /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy Payload"}
                </button>
              </div>

              <pre className="json-code-block">
                <code>
                  {JSON.stringify(
                    {
                      requestHeader: {
                        "Host": "sandbox.safaricom.et",
                        "Authorization": "Bearer oAuth2_Security_Token_Mpesa_ET",
                        "Content-Type": "application/json"
                      },
                      endpoint: selectedLog.endpoint,
                      transactionType: selectedLog.type,
                      status: selectedLog.status,
                      timestamp: selectedLog.timestamp,
                      payload: {
                        BusinessShortCode: selectedLog.shortCode || "789201",
                        PartyA: selectedLog.phone || "251789201000",
                        PartyB: selectedLog.shortCode || "251712345678",
                        Amount: selectedLog.amountETB,
                        Currency: "ETB",
                        Remarks: selectedLog.details,
                        CheckoutRequestID: selectedLog.checkoutRequestId || "ws_CO_30092026_SANDBOX",
                        MpesaReceiptNumber: selectedLog.mpesaReceipt || "SDF91KA49X",
                        ResultCode: selectedLog.resultCode !== undefined ? selectedLog.resultCode : 0,
                        ResultDesc: selectedLog.resultDesc || "The service request is processed successfully."
                      }
                    },
                    null,
                    2
                  )}
                </code>
              </pre>
            </div>
          ) : (
            <div className="p-8 text-center text-muted">
              Select a transaction log to view full Daraja JSON payload
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
