import { NextResponse } from 'next/server';
import PAYPAY from '@paypayopa/paypayopa-sdk-node';

// 前に100%動いていた設定をそのまま復元
PAYPAY.Configure({
  clientId: "a_PnXI27uqa2_jjA1",
  clientSecret: "vfBvy86+rpiEQUfD3MkV01e4pZiVSLQt5xeglchak9s=",
  merchantId: "885953454935506944",
  productionMode: false,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = body.amount; // フロントから送られてくる金額

    const merchantPaymentId = `donation_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const payload = {
      merchantPaymentId: merchantPaymentId,
      amount: {
        amount: amount,
        currency: 'JPY',
      },
      codeType: 'ORDER_QR',
      orderDescription: 'サイトへのドネーション',
      isAuthorization: false,
    };

    // 前に動いていた本物の公式SDK通信
    const response: any = await new Promise((resolve) => {
      PAYPAY.QRCodeCreate(payload, (res: any) => {
        resolve(res);
      });
    });

    console.log("PayPay生データ:", response);

    // 新しいデザイン（page.tsx）が求めている「qrUrl」という名前に100%一致させて返す
    if (response.STATUS === 201 && response.BODY?.data?.url) {
      return NextResponse.json({
        success: true,
        merchantPaymentId: merchantPaymentId,
        qrUrl: response.BODY.data.url, // 👈 新デザインが受け取れる名前に修正
        amount: amount,
      });
    } else {
      return NextResponse.json({ 
        success: false, 
        error: response.BODY?.resultInfo?.message || "QRコードの生成に失敗しました" 
      });
    }

  } catch (error) {
    console.error("PayPay APIエラー:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}