import { NextResponse } from 'next/server';
// 🔴 正しい公式SDKを読み込む
import PAYPAY from '@paypayopa/paypayopa-sdk-node';

// れいさんが用意してくれた本物のキーとIDを設定（末尾の _jjA1 を含めた完全版）
PAYPAY.Configure({
  clientId: "a_PnXI27uqa2_jjA1",
  clientSecret: "vfBvy86+rpiEQUfD3MkV01e4pZiVSLQt5xeglchak9s=",
  merchantId: "885953454935506944",
  productionMode: false, // falseなのでSandbox（テスト環境）に繋がります
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = body.amount;

    // 1. ユニークな決済IDを自動生成する
    const merchantPaymentId = `donation_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    // 2. PayPayの公式ルールに合わせてデータを作る
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

    // 3. 🔴 本物の公式SDKを使って、PayPayのテストサーバーへリクエストを送る！
    const response: any = await new Promise((resolve) => {
      PAYPAY.QRCodeCreate(payload, (res: any) => {
        resolve(res);
      });
    });

    console.log("PayPayからの生データ:", response);

    // 4. PayPayから無事にQRコードのURLが返ってきた場合の処理 (ステータス201が成功)
    // フロントの挙動（data.success === true）と完全に一致させます
    if (response.STATUS === 201 && response.BODY?.data?.url) {
      return NextResponse.json({
        success: true,
        merchantPaymentId: merchantPaymentId,
        qrUrl: response.BODY.data.url, // 👈 これがフロントの activePayPayTx.qrUrl に渡ります！
        amount: amount,
      });
    } else {
      // 弾かれた場合、PayPayからエラー理由（message や CODE）をフロントに返す
      const errorMessage = response.BODY?.resultInfo?.message || response.BODY?.resultInfo?.code || "QRコードの生成に失敗しました";
      return NextResponse.json({ 
        success: false, 
        error: errorMessage
      });
    }

  } catch (error) {
    console.error("PayPay APIエラー:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}