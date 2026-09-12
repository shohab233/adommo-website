import tls from 'tls';
import fs from 'fs';
import path from 'path';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

function getCredentials(): { user: string; pass: string } {
  let user = process.env.GMAIL_USER?.trim() || '';
  let pass = process.env.GMAIL_APP_PASSWORD?.trim()?.replace(/\s+/g, '') || '';

  return { user, pass };
}

/**
 * 100% Free Native Zero-Dependency SMTP Client using Node.js TLS
 * Directly connects to Gmail SMTP (smtp.gmail.com:465)
 */
export async function sendMailViaGmail(options: SendMailOptions): Promise<{ success: boolean; message: string; devLog?: string }> {
  const { user, pass } = getCredentials();

  if (!user || !pass) {
    console.log('\n======================================================');
    console.log('📧 [DEV EMAIL SIMULATOR] GMAIL_USER / GMAIL_APP_PASSWORD not set in .env');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log('======================================================\n');
    return {
      success: true,
      message: 'ডেভ মোডে ওটিপি সফলভাবে জেনারেট হয়েছে। জিমেইল দিয়ে সরাসরি পাঠাতে .env ফাইলে GMAIL_USER এবং GMAIL_APP_PASSWORD দিন।',
      devLog: 'dev_simulated'
    };
  }

  return new Promise((resolve, reject) => {
    let responseLog = '';

    const socket = tls.connect(465, 'smtp.gmail.com', { rejectUnauthorized: false }, () => {
      // Handshake connected
    });

    socket.setEncoding('utf8');

    let step = 0;

    socket.on('data', (data: string) => {
      responseLog += data;

      if (step === 0 && data.startsWith('220')) {
        step++;
        socket.write('EHLO localhost\r\n');
      } else if (step === 1 && data.includes('250')) {
        step++;
        socket.write('AUTH LOGIN\r\n');
      } else if (step === 2 && data.startsWith('334')) {
        step++;
        socket.write(Buffer.from(user).toString('base64') + '\r\n');
      } else if (step === 3 && data.startsWith('334')) {
        step++;
        socket.write(Buffer.from(pass).toString('base64') + '\r\n');
      } else if (step === 4 && data.startsWith('235')) {
        step++;
        socket.write(`MAIL FROM:<${user}>\r\n`);
      } else if (step === 5 && data.startsWith('250')) {
        step++;
        socket.write(`RCPT TO:<${options.to}>\r\n`);
      } else if (step === 6 && data.startsWith('250')) {
        step++;
        socket.write('DATA\r\n');
      } else if (step === 7 && data.startsWith('354')) {
        step++;
        const boundary = '----=_Part_' + Date.now();
        const emailMessage = [
          `From: "Adommo EdTech (অদম্য এডটেক)" <${user}>`,
          `To: ${options.to}`,
          `Subject: =?UTF-8?B?${Buffer.from(options.subject).toString('base64')}?=`,
          'MIME-Version: 1.0',
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          '',
          `--${boundary}`,
          'Content-Type: text/html; charset=UTF-8',
          'Content-Transfer-Encoding: base64',
          '',
          Buffer.from(options.html).toString('base64'),
          `--${boundary}--`,
          '\r\n.\r\n'
        ].join('\r\n');

        socket.write(emailMessage);
      } else if (step === 8 && data.startsWith('250')) {
        step++;
        socket.write('QUIT\r\n');
        socket.end();
        resolve({ success: true, message: 'জিমেইলে ওটিপি সফলভাবে পাঠানো হয়েছে।' });
      } else if (data.startsWith('5')) {
        socket.end();
        resolve({
          success: false,
          message: 'জিমেইল প্রমাণীকরণে সমস্যা হয়েছে। অনুগ্রহ করে আপনার অ্যাপ পাসওয়ার্ড চেক করুন।'
        });
      }
    });

    socket.on('error', (err) => {
      resolve({ success: false, message: 'ইমেইল সার্ভারের সাথে সংযোগে ত্রুটি: ' + err.message });
    });

    socket.setTimeout(10000, () => {
      socket.destroy();
      resolve({ success: false, message: 'ইমেইল পাঠাতে নির্ধারিত সময় পার হয়েছে।' });
    });
  });
}

/**
 * Generates an ultra-clean HTML email template for Adommo EdTech OTP
 */
export function getOtpHtmlEmail(otp: string, purpose: 'forgot_password' | 'registration', userName?: string): string {
  const isReset = purpose === 'forgot_password';
  const heading = isReset ? 'পাসওয়ার্ড রিসেট ভেরিফিকেশন কোড' : 'নতুন অ্যাকাউন্ট ভেরিফিকেশন কোড';
  const subHeading = isReset
    ? 'আপনার অদম্য অ্যাকাউন্টের পাসওয়ার্ড পরিবর্তনের জন্য নিচের ওটিপি কোডটি ব্যবহার করুন।'
    : 'অদম্য এডটেক প্ল্যাটফর্মে রেজিস্ট্রেশন সম্পন্ন করতে নিচের ওটিপি কোডটি ব্যবহার করুন।';

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>${heading}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b;">
    <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
      <tr>
        <td align="center">
          <table width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.06); border: 1px solid #f1f5f9;">
            <!-- Header Banner -->
            <tr>
              <td style="background: linear-gradient(135deg, #fa507e 0%, #ec376d 100%); padding: 36px 30px; text-align: center;">
                <h1 style="margin: 0; color: #ffffff; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">ADOMMO EDTECH</h1>
                <p style="margin: 6px 0 0 0; color: #ffe4e9; font-size: 13px; font-weight: 600;">অদম্য অনলাইন এডুকেশন সিস্টেম</p>
              </td>
            </tr>

            <!-- Content Area -->
            <tr>
              <td style="padding: 36px 32px;">
                <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 800; color: #0f172a;">${heading}</h2>
                <p style="margin: 0 0 24px 0; font-size: 14px; line-height: 1.6; color: #64748b;">
                  ${userName ? `প্রিয় ${userName},<br>` : ''}
                  ${subHeading}
                </p>

                <!-- OTP Code Display Card -->
                <div style="background: #fdf2f4; border: 2px dashed #f43f5e; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
                  <span style="font-size: 12px; font-weight: 800; color: #e11d48; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">আপনার ওটিপি কোড (OTP)</span>
                  <div style="font-size: 38px; font-weight: 900; letter-spacing: 10px; color: #be123c; font-family: 'Courier New', Courier, monospace;">
                    ${otp}
                  </div>
                  <span style="font-size: 12px; color: #9f1239; font-weight: 600; display: block; margin-top: 8px;">⏱️ কোডটির মেয়াদ ৫ মিনিট</span>
                </div>

                <p style="margin: 0 0 16px 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                  ⚠️ আপনি যদি এই ওটিপি কোডের জন্য অনুরোধ না করে থাকেন, তবে অনুগ্রহ করে এই বার্তাটি উপেক্ষা করুন এবং আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করুন।
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #f1f5f9;">
                <p style="margin: 0; font-size: 11px; color: #94a3b8;">
                  © 2026 Adommo EdTech. সর্বস্বত্ব সংরক্ষিত।<br>
                  সহায়তা ও যোগাযোগ: support@adommo.com
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}
