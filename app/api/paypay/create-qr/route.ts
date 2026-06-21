import { NextResponse } from 'next/server';
import * as crypto from 'crypto';

interface PayPayResponse {
  resultInfo?: {
    code?: string;
    message?: string;
  };
  data?: {
    url?: string;
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const amount = body.amount;

    // れいさんの本物のキーとID（そのまま引き継いでいます）
    // 👇 新しく教えてくれた正確なキーに修正しました！
    const clientId = "a_PnXI27uqa2";
    const clientSecret = "vfBvy86+rpiEQUfD3MkV01e4pZiVSLQt5xeglchak9s=";
    const merchantId = "885953454935506944";

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

    // Vercelをフリーズさせないために、自前で安全に署名を計算する
    const epoch = Math.floor(Date.now() / 1000).toString();
    const nonce = crypto.randomBytes(8).toString('hex');
    const requestBody = JSON.stringify(payload);
    const contentType = 'application/json';
    const requestUrl = '/v2/codes';

    const signatureRawList = [
      requestUrl,
      'POST',
      nonce,
      epoch,
      contentType,
      requestBody
    ];
    const signatureRaw = signatureRawList.join('\n');
    const hmac = crypto.createHmac('sha256', clientSecret);
    const signature = hmac.update(signatureRaw).digest('base64');

    const authHeader = `hmac userName="${clientId}", password="${signature}", nonce="${nonce}", epoch="${epoch}", isProfile="false"`;

    // SDKを挟まず、Next.js標準のfetchで直接PayPayテストサーバーへ叩く
    const paypayRes = await fetch('https://stg-api.paypay.ne.jp/v2/codes', {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
        'Authorization': authHeader,
        'X-ASSUME-MERCHANT': merchantId,
      },
      body: requestBody,
    });

    const responseData = (await paypayRes.json()) as PayPayResponse;

    if (responseData.resultInfo?.code === 'SUCCESS' && responseData.data?.url) {
      return NextResponse.json({
        success: true,
        merchantPaymentId: merchantPaymentId,
        qrUrl: responseData.data.url, // フロント側（page.tsx）が受け取る変数名
        amount: amount,
      });
    } else {
      return NextResponse.json({
        success: false,
        error: responseData.resultInfo?.message || "QRコード生成に失敗しました"
      });
    }

  } catch (error) {
    console.error("PayPay APIエラー:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}