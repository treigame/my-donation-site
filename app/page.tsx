"use client";

import React, { useState } from 'react';

export default function DonationComponent() {
  const [showAddFundsModal, setShowAddFundsModal] = useState(true);
  const [addAmountInput, setAddAmountInput] = useState<string>("1000");
  const [payPayLoading, setPayPayLoading] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [showThanks, setShowThanks] = useState<boolean>(false);
  const [lastDonationAmount, setLastDonationAmount] = useState<number>(0);

  // PayPay取引の状態（本物のURLを受け取る）
  const [activePayPayTx, setActivePayPayTx] = useState<{
    merchantPaymentId: string;
    qrUrl: string;
    amount: number;
  } | null>(null);

  const validateAmount = (amountStr: string): number | null => {
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount < 1 || amount > 1000000) {
      alert("⚠️ ドネーション金額は1円から最高100万円までで指定してください。");
      return null;
    }
    return amount;
  };

  const handleDonationSuccess = (amount: number) => {
    setBalance(prev => prev + amount);
    setLastDonationAmount(amount);
    setShowAddFundsModal(false);
    setActivePayPayTx(null);
    setShowThanks(true);
  };

  return (
    <div className="p-8 bg-slate-100 min-h-screen font-sans flex flex-col items-center justify-center text-slate-900">
      
      {/* 寄付総額表示パネル */}
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-md text-center mb-6">
        <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">これまでの寄付総額</h2>
        <p className="text-3xl font-black text-slate-900 mt-1">¥{balance.toLocaleString()}</p>
        <button 
          onClick={() => {
            setActivePayPayTx(null); // クリアして開く
            setShowAddFundsModal(true);
          }}
          className="mt-4 px-6 py-2.5 bg-[#FF0033] text-white font-bold rounded-xl shadow-md hover:bg-[#e6002e] transition-all"
        >
          🎁 ドネーションする
        </button>
      </div>

      {/* モーダル */}
      {showAddFundsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <span>💝 ドネーション金額の入力</span>
              </h3>
              <button onClick={() => setShowAddFundsModal(false)} className="text-slate-400 hover:text-slate-600 font-mono text-sm">[閉じる]</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block mb-1">寄付金額 (1円 〜 1,000,000円)</label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-bold text-slate-400 text-sm">¥</span>
                  <input
                    type="number"
                    value={addAmountInput}
                    onChange={(e) => setAddAmountInput(e.target.value)}
                    className="w-full text-slate-800 text-sm font-semibold rounded-xl border border-slate-200 pl-7 pr-2.5 p-2.5 outline-none focus:border-[#FF0033]"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={payPayLoading}
                  onClick={async () => {
                    const verifiedAmount = validateAmount(addAmountInput);
                    if (!verifiedAmount) return;

                    setPayPayLoading(true);
                    try {
                      const res = await fetch('/api/paypay/create-qr', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ amount: verifiedAmount }),
                      });
                      const data = await res.json();
                      
                      if (data.success) {
                        // 🟢 裏側(route.ts)から返ってきた本物のデータをセット！
                        setActivePayPayTx({
                          merchantPaymentId: data.merchantPaymentId,
                          qrUrl: data.qrUrl,
                          amount: data.amount,
                        });
                      } else {
                        alert(`❌ PayPayエラー: ${data.error}`);
                      }
                    } catch (e) {
                      console.error(e);
                      alert("通信エラーが発生しました。");
                    } finally {
                      setPayPayLoading(false);
                    }
                  }}
                  className="w-full bg-[#FF0033] hover:bg-[#e6002e] disabled:opacity-50 text-white py-3.5 px-4 rounded-xl text-sm font-black tracking-wide transition-all shadow-lg"
                >
                  {payPayLoading ? "PayPayと通信中..." : `PayPayで本物通信を開始する`}
                </button>
              </div>

              {/* 🔴 通信が成功したら、PayPayが発行した本物の決済ページへのボタンだけを出す！ */}
              {activePayPayTx && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col items-center gap-3 text-center">
                  <span className="font-bold text-emerald-700 text-xs">✅ PayPayとの本物通信に成功！</span>
                  <p className="text-[11px] text-slate-600">下のボタンを押すと、PayPay公式のテスト決済画面（ログイン・QR表示）に飛びます！</p>
                  
                  <a
                    href={activePayPayTx.qrUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md transition-all text-center block"
                  >
                    🚀 OPEN PAYPAY CHECKOUT 画面を開く
                  </a>

                  <button
                    onClick={() => handleDonationSuccess(activePayPayTx.amount)}
                    className="w-full py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-[10px] font-medium transition-all"
                  >
                    (テスト用に強制的に支払いを完了させる)
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 感謝ポップアップ */}
      {showThanks && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-sm w-full p-8 shadow-2xl text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="font-black text-2xl text-rose-600 mb-2">ありがとうございます！</h3>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-6">
              <span className="text-2xl font-black text-slate-800">¥{lastDonationAmount.toLocaleString()}</span>
            </div>
            <button onClick={() => setShowThanks(false)} className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-xl text-sm">閉じる</button>
          </div>
        </div>
      )}
    </div>
  );
}