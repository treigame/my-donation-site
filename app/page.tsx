"use client";

import { useState } from "react";

type OmikujiResult = {
  fortune: string;
  description: string;
  color: string;
};

export default function Home() {
  const [amount, setAmount] = useState<string>("100");
  const [loading, setLoading] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [fortuneText, setFortuneText] = useState<OmikujiResult | null>(null);
  const [isPaperVisible, setIsPaperVisible] = useState<boolean>(false);
  const [isOpened, setIsOpened] = useState<boolean>(false);

  // おみくじの確率計算
  const drawOmikuji = (): OmikujiResult => {
    const rand = Math.random() * 100; // 0〜100の乱数

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
    setLoading(true);
    try {
      const res = await fetch("/api/paypay/create-qr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const data = await res.json();
      
      if (data.url) {
        // PayPayテスト画面へ移動
        window.location.href = data.url;
        
        // ※デモ・テスト確認用に、決済成功して戻ってきたと仮定する動作を仕込む場合：
        // 実際にはPayPayから戻った後にこの処理を走らせるため、今回はシミュレーション用の処理
      } else {
        alert("QRコードの作成に失敗しました。");
      }
    } catch (err) {
      console.error(err);
      alert("エラーが発生しました。");
    } finally {
      setLoading(false);
    }
  };

  // テスト用：PayPay支払い成功をスキップして、おみくじアニメーションをすぐ見たい場合用
  const simulateSuccess = () => {
    setFortuneText(drawOmikuji());
    setIsPaperVisible(true);
    setIsOpened(false);
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-between bg-cover bg-center overflow-hidden" 
          style={{ backgroundImage: "url('/shrine.png')" }}>
      
      {/* 遮光オーバーレイ（神社を背景として見やすくする） */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* 上部：金額設定 */}
      <div className="relative z-10 mt-8 bg-white/90 p-4 rounded-xl shadow-xl border-2 border-red-500 text-center max-w-xs w-full mx-4">
        <h1 className="text-xl font-bold text-red-700 mb-2">電子お賽銭・おみくじ</h1>
        <label className="block text-sm text-gray-600 mb-1">お賽銭の金額 (円)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full text-center text-2xl font-bold border-2 border-gray-300 rounded p-1 mb-2 text-black"
          min="1"
        />
        <p className="text-xs text-gray-500">お賽銭を入れると、おみくじが引けます</p>
        <button 
          onClick={simulateSuccess} 
          className="mt-2 text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600 transition"
        >
          ⚙️ テスト：即おみくじを引く
        </button>
      </div>

      {/* 中央〜下部：お賽銭箱タップエリア */}
      <div className="relative z-10 mb-16 flex flex-col items-center w-full">
        {/* お賽銭箱の当たり判定エリア（神社の画像のお賽銭箱の位置に合わせて調整） */}
        <button
          onClick={handlePayPayCheckout}
          disabled={loading}
          className="group relative w-64 h-36 bg-amber-900/40 hover:bg-amber-500/20 border-4 border-dashed border-amber-400 rounded-lg flex flex-col items-center justify-center transition-all shadow-2xl backdrop-blur-xs"
        >
          <span className="bg-red-600 text-white font-bold px-4 py-1 rounded shadow animate-bounce text-sm">
            {loading ? "通信中..." : "ここをタッチしてお賽銭"}
          </span>
          <span className="text-amber-200 text-xs mt-2 font-semibold tracking-wider group-hover:scale-110 transition-transform">
            💸 PayPayでお支払い
          </span>
        </button>
      </div>

      {/* ⛩️ 右から左へシャッと出る「おみくじの紙」のアニメーション */}
      <div
        className={`fixed top-1/2 -translate-y-1/2 right-0 z-50 transition-all duration-700 ease-out flex items-center ${
          isPaperVisible ? "translate-x-[-20px]" : "translate-x-full"
        }`}
      >
        {!isOpened ? (
          // タップする前の紐で縛られたおみくじの紙
          <button
            onClick={() => setIsOpened(true)}
            className="bg-[#fcf8f2] border-2 border-amber-800 text-amber-900 px-4 py-12 font-bold rounded shadow-2xl cursor-pointer hover:bg-amber-50 active:scale-95 transition-all text-xl tracking-widest [writing-mode:vertical-rl] animate-pulse"
          >
            📜 おみくじを開く (タップ)
          </button>
        ) : (
          // タップして開いた結果画面
          <div className="bg-[#fcf8f2] border-4 double border-amber-900 p-6 rounded-lg shadow-2xl max-w-sm w-80 text-black flex flex-col items-center text-center relative border-double">
            <h2 className="text-gray-500 text-sm font-bold tracking-widest mb-1">武蔵野電子神社</h2>
            <div className="w-full h-px bg-amber-800 my-2" />
            
            <p className="text-xs text-gray-400 tracking-widest">あなたの運勢</p>
            <h3 className="text-5xl font-black my-4 tracking-widest" style={{ color: fortuneText?.color }}>
              {fortuneText?.fortune}
            </h3>
            
            <div className="w-full h-px bg-amber-800 my-2" />
            <p className="text-sm text-amber-950 font-medium leading-relaxed my-3 bg-white/60 p-3 rounded border border-amber-200">
              {fortuneText?.description}
            </p>
            
            <button
              onClick={() => setIsPaperVisible(false)}
              className="mt-4 w-full bg-amber-800 text-white font-bold py-2 rounded shadow hover:bg-amber-900 transition"
            >
              閉じる
            </button>
          </div>
        )}
      </div>
    </main>
  );
}