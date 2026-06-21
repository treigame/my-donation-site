"use client";

import { useState } from "react";

type OmikujiResult = {
  fortune: string;
  description: string;
  color: string;
};

export default function Home() {
  // PayPayエラー回避のため、初期値を「500円」に設定
  const [amount, setAmount] = useState<string>("500");
  const [loading, setLoading] = useState<boolean>(false);
  const [fortuneText, setFortuneText] = useState<OmikujiResult | null>(null);
  const [isPaperVisible, setIsPaperVisible] = useState<boolean>(false);
  const [isOpened, setIsOpened] = useState<boolean>(false);

  // おみくじの確率計算
  const drawOmikuji = (): OmikujiResult => {
    const rand = Math.random() * 100;

    if (rand < 3) return { fortune: "終わり", description: "すべてがリセットされる時。新たな始まりかも？", color: "#4a5568" };
    if (rand < 3 + 5) return { fortune: "大凶", description: "これ以上下がることはない！あとは上がるだけ！", color: "#e53e3e" };
    if (rand < 3 + 5 + 7) return { fortune: "凶", description: "忘れ物に注意。慎重に行動すれば難を逃れます。", color: "#dd6b20" };
    if (rand < 3 + 5 + 7 + 15) return { fortune: "末吉", description: "じわじわと運気が良くなる、伸びしろ抜群の運勢！", color: "#3182ce" };
    if (rand < 3 + 5 + 7 + 15 + 25) return { fortune: "吉", description: "なかなかに良い運気。日常の小さな幸せを楽しんで。", color: "#38a169" };
    if (rand < 3 + 5 + 7 + 15 + 25 + 20) return { fortune: "中吉", description: "結構いい感じ！友達と遊ぶとさらに運気アップ！", color: "#319795" };
    if (rand < 3 + 5 + 7 + 15 + 25 + 20 + 15) return { fortune: "大吉", description: "最高の一日！やりたいことに全力で挑戦しよう！", color: "#e53e3e" };
    return { fortune: "運良すぎ！", description: "奇跡の確率を引き当てました！今日のアナタは無敵です！", color: "#d69e2e" };
  };

  const handlePayPayCheckout = async () => {
    // 100円未満だとPayPay側がエラーを吐くためのガード
    if (Number(amount) < 100) {
      alert("PayPayのテスト仕様上、お賽銭は100円以上で入力してください！");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/paypay/create-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      
      const data = await res.json();
      console.log("PayPay Response Data:", data); // ブラウザのF12コンソールでエラーの正体を見れるようにする
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(`QRコードの作成に失敗しました。\n理由: ${data.error || "不明なエラー"}\n※お賽銭の金額を300円や500円に変えて試してみてください。`);
      }
    } catch (err) {
      console.error("Fetch Error:", err);
      alert("通信エラーが発生しました。サーバーの環境変数（キー）がVercelに入っているか確認してください。");
    } finally {
      setLoading(false);
    }
  };

  // テスト用ボタンの処理
  const simulateSuccess = () => {
    setFortuneText(drawOmikuji());
    setIsPaperVisible(true);
    setIsOpened(false);
  };

  return (
    <main 
      className="relative min-h-screen w-full flex flex-col items-center justify-between bg-cover bg-center overflow-hidden" 
      style={{ backgroundImage: "url('https://japaclip.com/files/shrine.png')" }} // 直接外部URLから読み込み
    >
      
      {/* 遮光オーバーレイ（神社を背景として文字を読みやすくする） */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* 上部：金額設定 */}
      <div className="relative z-10 mt-8 bg-white/95 p-5 rounded-xl shadow-2xl border-2 border-red-600 text-center max-w-xs w-full mx-4">
        <h1 className="text-xl font-black text-red-700 mb-1 tracking-wider">⛩️ インターネット神社</h1>
        <p className="text-[10px] text-gray-400 font-mono mb-3">Cyber Shrine System v1.0</p>
        
        <label className="block text-xs text-gray-600 mb-1">お賽銭の金額 (100円以上)</label>
        <div className="relative flex items-center justify-center">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full text-center text-3xl font-black border-2 border-red-200 rounded p-1 mb-2 text-black bg-amber-50/50"
            min="100"
          />
          <span className="absolute right-4 bottom-4 font-bold text-gray-500">円</span>
        </div>
        
        <p className="text-[11px] text-red-600 font-medium">※お賽銭完了後、おみくじがシャッと出ます</p>
        
        <button 
          onClick={simulateSuccess} 
          className="mt-3 text-[10px] bg-stone-700 text-stone-200 px-3 py-1 rounded-full hover:bg-stone-900 transition tracking-tight"
        >
          ⚙️ 賽銭をスキップしておみくじを引く
        </button>
      </div>

      {/* 中央〜下部：お賽銭箱タッチエリア */}
      <div className="relative z-10 mb-20 flex flex-col items-center w-full">
        <button
          onClick={handlePayPayCheckout}
          disabled={loading}
          className="group relative w-72 h-40 bg-amber-950/20 hover:bg-red-600/10 border-4 border-dashed border-red-500 rounded-xl flex flex-col items-center justify-center transition-all shadow-2xl backdrop-blur-xs"
        >
          <div className="absolute -top-4 bg-red-600 text-white font-black px-5 py-1 rounded-full shadow-lg animate-bounce text-xs tracking-widest">
            {loading ? "通信中..." : "ここをタッチしてお賽銭箱へ"}
          </div>
          <span className="text-xl font-bold text-amber-100 tracking-widest drop-shadow-md">お賽銭箱</span>
          <span className="text-red-300 text-[10px] mt-2 font-mono tracking-wider group-hover:text-white transition-colors">
            [ TAP TO PAY WITH PAYPAY ]
          </span>
        </button>
      </div>

      {/* 📜 右から左へシャッと出るおみくじ */}
      <div
        className={`fixed top-1/2 -translate-y-1/2 right-0 z-50 transition-all duration-700 ease-out flex items-center ${
          isPaperVisible ? "translate-x-[-30px]" : "translate-x-full"
        }`}
      >
        {!isOpened ? (
          <button
            onClick={() => setIsOpened(true)}
            className="bg-[#fcf8f2] border-2 border-amber-900 text-amber-950 px-5 py-14 font-black rounded-l-xl shadow-2xl cursor-pointer hover:bg-amber-50 active:scale-95 transition-all text-xl tracking-widest [writing-mode:vertical-rl] animate-pulse"
          >
            📜 おみくじを開く (タップ)
          </button>
        ) : (
          <div className="bg-[#fcf8f2] border-4 double border-amber-900 p-6 rounded-lg shadow-2xl max-w-sm w-80 text-black flex flex-col items-center text-center relative border-double">
            <h2 className="text-red-700 text-base font-black tracking-widest mb-1">インターネット神社</h2>
            <div className="w-full h-px bg-amber-800 my-2" />
            
            <p className="text-xs text-gray-400 tracking-widest">あなたの電脳運勢</p>
            <h3 className="text-5xl font-black my-5 tracking-widest" style={{ color: fortuneText?.color }}>
              {fortuneText?.fortune}
            </h3>
            
            <div className="w-full h-px bg-amber-800 my-2" />
            <p className="text-xs text-amber-950 font-bold leading-relaxed my-3 bg-white/80 p-3 rounded border border-amber-200">
              {fortuneText?.description}
            </p>
            
            <button
              onClick={() => setIsPaperVisible(false)}
              className="mt-4 w-full bg-red-700 text-white font-bold py-2 rounded shadow hover:bg-red-800 transition text-sm tracking-widest"
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </main>
  );
}