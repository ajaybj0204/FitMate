import React, { useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import { isValidUpiId } from '../lib/gym';

/**
 * Public page opened from a fee reminder: #pay?pa=<upi id>&pn=<gym>&am=<amount>&tn=<note>.
 * It only builds a standard UPI payment link; money goes straight from the member's UPI app
 * to the gym. FITORA never handles the payment.
 */
export const isPayHash = (hash: string) => hash.startsWith('#pay?');

export const PayPage: React.FC = () => {
  const params = useMemo(() => new URLSearchParams(window.location.hash.slice('#pay?'.length)), []);
  const pa = (params.get('pa') || '').trim();
  const pn = (params.get('pn') || 'Gym').slice(0, 60);
  const am = Number(params.get('am') || 0);
  const tn = (params.get('tn') || 'Membership fee').slice(0, 60);
  const valid = isValidUpiId(pa) && am > 0 && am <= 200000;

  const upiUrl = useMemo(() => {
    const q = new URLSearchParams({ pa, pn, am: am.toFixed(2), cu: 'INR', tn });
    return `upi://pay?${q.toString()}`;
  }, [pa, pn, am, tn]);

  const [qr, setQr] = useState('');
  useEffect(() => {
    if (valid) QRCode.toDataURL(upiUrl, { width: 480, margin: 2 }).then(setQr);
  }, [valid, upiUrl]);
  const isPhone = /Android|iPhone|iPad/i.test(navigator.userAgent);

  return (
    <div className="min-h-screen bg-[#081425] text-[#d8e3fb] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-[#152031] border border-[#1f2a3c] rounded-3xl p-6 text-center shadow-2xl">
        <div className="text-[11px] font-bold uppercase tracking-wider text-[#4edea3]">Membership fee</div>
        {!valid ? (
          <>
            <h1 className="font-headline text-xl font-bold mt-2">This payment link is incomplete</h1>
            <p className="text-sm text-[#bbcabf] mt-2">Please pay at the gym desk, or ask the gym to send the reminder again.</p>
          </>
        ) : (
          <>
            <h1 className="font-headline text-2xl font-extrabold mt-1">{pn}</h1>
            <div className="font-headline text-4xl font-extrabold text-[#4edea3] mt-3 tabular-nums">₹{am.toLocaleString('en-IN')}</div>
            <p className="text-xs text-[#86948a] mt-1">{tn}</p>

            <a
              href={upiUrl}
              className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-[#4edea3] hover:bg-[#6ffbbe] text-[#003824] font-extrabold py-3.5 rounded-2xl"
            >
              <span className="material-symbols-outlined">account_balance_wallet</span>
              Pay with UPI app
            </a>
            <p className="text-[11px] text-[#86948a] mt-2">Opens GPay, PhonePe, Paytm or your bank app with the amount filled in.</p>

            {qr && (
              <div className={isPhone ? 'mt-5' : 'mt-4'}>
                <p className="text-xs text-[#bbcabf] mb-2">{isPhone ? 'Or scan from another phone:' : 'Scan with any UPI app:'}</p>
                <img src={qr} alt="UPI payment QR code" className="w-48 h-48 mx-auto rounded-xl bg-white p-2" />
              </div>
            )}

            <div className="mt-4 text-[11px] text-[#86948a] bg-[#0b1420] rounded-xl p-3 text-left">
              Paying to UPI ID <strong className="text-[#bbcabf] break-all">{pa}</strong>. Check the name your UPI app shows before you pay. After paying, show the payment screen at the desk so the gym can mark you paid.
            </div>
          </>
        )}
        <a href="/" className="block text-xs text-[#4edea3] mt-5 hover:underline">Powered by FITORA</a>
      </div>
    </div>
  );
};
