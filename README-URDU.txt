TIKTOK GROWTH PRO — STARTER KIT

Yeh production-ready complete service nahin; yeh backend + frontend starter hai.
Ismein secure OAuth start/callback ka basic flow hai. TikTok password kabhi apni site par na lein.

RUN KARNE KA TAREEQA
1) Computer par Node.js 18 ya newer install karein.
2) Is folder mein terminal kholein.
3) npm install
4) .env.example ki copy bana kar .env naam dein.
5) TikTok developer portal se approved Client Key aur Client Secret .env mein add karein.
6) APP_BASE_URL aur TIKTOK_REDIRECT_URI ko apne HTTPS domain ke mutabiq set karein.
7) npm start
8) Browser mein http://localhost:3000 kholein (local testing only).

TIKTOK KI ZAROORI SETTINGS
- TikTok developer account aur app register karna hoga.
- Login Kit aur required API products/scopes ki approval darkar ho sakti hai.
- Redirect URI bilkul developer portal wali URI se match honi chahiye.
- Scope request: user.info.basic, user.info.stats, video.list
- Har user ko TikTok par khud consent dena hoga.

ABHI KYA KAAM KARTA HAI
- Dashboard shell
- TikTok OAuth redirect aur callback ka starter
- State cookie check
- Basic security headers aur auth rate limit
- Demo plans / setup status

ABHI KYA BAQI HAI PUBLIC LAUNCH SE PEHLE
- Real user registration/login and password reset
- Database (users, subscriptions, encrypted OAuth tokens)
- Token encryption, refresh and revoke/disconnect
- Profile/video API fetching and permitted fields
- Admin roles and audit logs
- Payment provider integration, webhook verification and invoices
- Privacy policy, terms, data deletion flow
- HTTPS hosting, backups, monitoring, security review
- TikTok app review/approval

IMPORTANT
TikTok API sirf wahi fields deta hai jin ke liye app approved ho aur user consent de.
Yeh software artificial engagement provide nahin karta.
.env file, Client Secret, access tokens ya passwords kisi ko share na karein.
