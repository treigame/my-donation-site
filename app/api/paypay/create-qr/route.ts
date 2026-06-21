import { NextResponse } from 'next/server';
// 🔴 正しい公式SDKを読み込む
import PAYPAY from '@paypayopa/paypayopa-sdk-node';

// れいさんが用意してくれた本物のキーとIDを設定
PAYPAY.Configure({
  clientId: "a_PnXI27uqa2_jjA1",
  clientSecret: "vfBvy86+rpiEQUfD3MkV01e4pZiVSLQt5xeglchak9s=",
  merchantId: "885953454935506944",
  productionMode: false, // 👈 falseなのでSandbox（テスト環境）に繋がります
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
    // 同期処理として結果を待つために Promise を使ってラップします
    const response: any = await new Promise((resolve) => {
      PAYPAY.QRCodeCreate(payload, (res: any) => {
        resolve(res);
      });
    });

    console.log("PayPayからの生データ:", response);

    // 4. PayPayから無事にQRコードのURLが返ってきた場合の処理 (ステータス201が成功)
    if (response.STATUS === 201 && response.BODY?.data?.url) {
      return NextResponse.json({
        success: true,
        merchantPaymentId: merchantPaymentId,
        qrUrl: response.BODY.data.url, // 👈 これが本物のPayPayテスト用URLになります！
        amount: amount,
        isMock: false
      });
    } else {
      // 弾かれた場合、PayPayからエラー理由（CODE）が返ってきます
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