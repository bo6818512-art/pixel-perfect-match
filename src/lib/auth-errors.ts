export function registrationError(code: string | undefined, message: string): string {
  if (/could not be delivered|message was not sent|email.*bounc/i.test(message)) return 'تعذر توصيل رسالة تأكيد لهذا البريد مؤخرًا. تأكد أن البريد يستقبل الرسائل أو استخدم بريدًا آخر.';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'تم تجاوز عدد المحاولات المسموح. انتظر قليلًا ثم حاول مرة أخرى.';
  if (code === 'email_exists' || code === 'user_already_exists') return 'هذا البريد مسجل بالفعل. استخدم تسجيل الدخول أو استعادة كلمة المرور.';
  if (code === 'weak_password') return 'اختر كلمة مرور أقوى تحتوي على أحرف وأرقام ورموز.';
  if (code === 'email_provider_disabled' || code === 'signup_disabled') return 'إنشاء الحسابات غير متاح مؤقتًا. يرجى التواصل مع إدارة الموقع.';
  if (code === 'email_address_invalid' || code === 'email_address_not_authorized' || /email address is not allowed|email.*invalid/i.test(message)) return 'يرجى استخدام بريد إلكتروني حقيقي يمكنه استقبال رسالة تأكيد الحساب.';
  if (code === 'unexpected_failure' && /database/i.test(message)) return 'تعذر حفظ بيانات الحساب. يرجى المحاولة لاحقًا أو التواصل مع إدارة الموقع.';
  return 'تعذر إنشاء الحساب. تحقق من اتصال الإنترنت والبيانات ثم حاول مرة أخرى.';
}