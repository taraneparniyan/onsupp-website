import { sanitizeArticleHtml, safeJsonLdStringify, ALLOWED_ARTICLE_TAGS } from './lib/sanitize.js';

async function runXssTests() {
  console.log('[TEST-XSS] Running XSS & JSON-LD Security Tests...\n');

  let passed = 0;
  let failed = 0;

  function assert(name: string, condition: boolean, detail?: string) {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  console.log('================================================================');
  console.log('بخش ۱: حذف تگ‌های اسکریپت و عناصر خطرناک (HTML Tags Elimination)');
  console.log('================================================================');

  // Test 1.1: Direct script tag
  const dirtyScript = '<p>مقدمه مقاله</p><script>alert("XSS")</script><p>ادامه مقاله</p>';
  const cleanScript = sanitizeArticleHtml(dirtyScript);
  assert(
    'تگ <script> باید کاملاً از محتوای مقاله حذف شود',
    !cleanScript.includes('<script>') && !cleanScript.includes('alert') && cleanScript.includes('مقدمه مقاله'),
    cleanScript,
  );

  // Test 1.2: iframes, embeds, and objects
  const dirtyEmbed = '<p>متن</p><iframe src="https://malicious.com"></iframe><object data="evil.swf"></object><embed src="evil.swf">';
  const cleanEmbed = sanitizeArticleHtml(dirtyEmbed);
  assert(
    'تگ‌های iframe, object, embed باید کاملاً پاک‌سازی شوند',
    !cleanEmbed.includes('iframe') && !cleanEmbed.includes('object') && !cleanEmbed.includes('embed'),
    cleanEmbed,
  );

  // Test 1.3: SVG and MathML script payloads
  const dirtySvg = '<svg onload="alert(1)"><g><script>alert(2)</script></g></svg>';
  const cleanSvg = sanitizeArticleHtml(dirtySvg);
  assert(
    'تگ‌های SVG و اسکریپت‌های توکار برداری باید حذف شوند',
    !cleanSvg.includes('<svg') && !cleanSvg.includes('alert'),
    cleanSvg,
  );

  console.log('\n================================================================');
  console.log('بخش ۲: حذف Event Handlerهای خطرناک (onerror, onload, onclick)');
  console.log('================================================================');

  // Test 2.1: Image onerror XSS
  const dirtyImg = '<img src="invalid-image.jpg" onerror="alert(document.cookie)" alt="توضیح تصویر" />';
  const cleanImg = sanitizeArticleHtml(dirtyImg);
  assert(
    'اتریبیوت onerror از تگ <img> حذف شود در حالی که خود تصویر و alt حفظ شود',
    !cleanImg.includes('onerror') && !cleanImg.includes('alert') && cleanImg.includes('alt="توضیح تصویر"'),
    cleanImg,
  );

  // Test 2.2: onclick, onmouseover, onload on standard tags
  const dirtyEvents = '<p onclick="alert(1)" onmouseover="alert(2)"><span onfocus="alert(3)">متن کلیک‌خور</span></p>';
  const cleanEvents = sanitizeArticleHtml(dirtyEvents);
  assert(
    'تمام اتریبیوت‌های جاوااسکریپتی (onclick, onmouseover, onfocus) حذف شوند',
    !cleanEvents.includes('onclick') && !cleanEvents.includes('onmouseover') && !cleanEvents.includes('onfocus') && cleanEvents.includes('متن کلیک‌خور'),
    cleanEvents,
  );

  console.log('\n================================================================');
  console.log('بخش ۳: مسدودسازی پروتکل‌ها و URLهای خطرناک (javascript: , data: , vbscript:)');
  console.log('================================================================');

  // Test 3.1: javascript: scheme in links
  const dirtyJsLink = '<a href="javascript:alert(\'pwned\')">کلیک کنید</a>';
  const cleanJsLink = sanitizeArticleHtml(dirtyJsLink);
  assert(
    'لینک‌های حاوی پروتکل javascript: باید مسدود و حذف شوند',
    !cleanJsLink.includes('javascript:') && !cleanJsLink.includes('alert'),
    cleanJsLink,
  );

  // Test 3.2: vbscript: scheme
  const dirtyVbLink = '<a href="vbscript:msgbox(1)">لینک وی‌بی‌اسکریپت</a>';
  const cleanVbLink = sanitizeArticleHtml(dirtyVbLink);
  assert(
    'لینک‌های حاوی پروتکل vbscript: باید مسدود شوند',
    !cleanVbLink.includes('vbscript:'),
    cleanVbLink,
  );

  // Test 3.3: data:text/html scheme
  const dirtyDataLink = '<a href="data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==">دانلود سند</a>';
  const cleanDataLink = sanitizeArticleHtml(dirtyDataLink);
  assert(
    'لینک‌های data:text/html برای ممانعت از اجرای صفحه جعلی باید مسدود شوند',
    !cleanDataLink.includes('data:text/html'),
    cleanDataLink,
  );

  // Test 3.4: Legitimate https / mailto / relative links preserved
  const validLink = '<a href="https://onsupp.ir/services" title="خدمات آن‌ساپ">مشاهده خدمات</a>';
  const cleanValidLink = sanitizeArticleHtml(validLink);
  assert(
    'لینک‌های معتبر https با ویژگی title به درستی حفظ شوند',
    cleanValidLink.includes('href="https://onsupp.ir/services"') && cleanValidLink.includes('title="خدمات آن‌ساپ"'),
    cleanValidLink,
  );

  console.log('\n================================================================');
  console.log('بخش ۴: حفظ قالب‌بندی و تگ‌های ضروری مقالات (Article Formatting)');
  console.log('================================================================');

  const richArticle = `
    <h2>عنوان سرفصل مقاله سئو</h2>
    <p>این یک <strong>پاراگراف آزمایشی</strong> با کلمات <em>مورب</em> و <u>خط زیرین</u> است.</p>
    <blockquote>نقل‌قول طلایی در بازاریابی دیجیتال</blockquote>
    <ul>
      <li>آیتم شماره یک لیست</li>
      <li>آیتم شماره دو لیست</li>
    </ul>
    <table>
      <thead><tr><th>ستون ۱</th><th>ستون ۲</th></tr></thead>
      <tbody><tr><td>داده ۱</td><td>داده ۲</td></tr></tbody>
    </table>
    <pre><code>const a = 10;</code></pre>
  `;

  const cleanRich = sanitizeArticleHtml(richArticle);
  assert(
    'تمام تگ‌های معمول مقالات (h2, p, strong, em, u, blockquote, ul, li, table, pre, code) حفظ شوند',
    cleanRich.includes('<h2>') &&
      cleanRich.includes('<strong>') &&
      cleanRich.includes('<blockquote>') &&
      cleanRich.includes('<ul>') &&
      cleanRich.includes('<table>') &&
      cleanRich.includes('<pre><code>'),
    cleanRich,
  );

  console.log('\n================================================================');
  console.log('بخش ۵: ایمن‌سازی ساختار JSON-LD در برابر Script Breakout');
  console.log('================================================================');

  // Test 5.1: Attack trying to close the script tag
  const maliciousJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: 'تیتر خبر</script><script>alert("JSON-LD-XSS")</script>',
    description: 'توضیحات با کد خطرناک <img src=x onerror=alert(1)>',
  };

  const safeJsonOutput = safeJsonLdStringify(maliciousJsonLd);

  assert(
    'خروجی JSON-LD نباید شامل کاراکتر خام < یا تگ بسته </script> باشد',
    !safeJsonOutput.includes('</script>') && !safeJsonOutput.includes('<script>'),
    safeJsonOutput,
  );

  assert(
    'کاراکترهای < به صورت امن به \\u003c یونیکد تبدیل شده باشند',
    safeJsonOutput.includes('\\u003c/script\\u003e'),
    safeJsonOutput,
  );

  // Test 5.2: Verify JSON is still 100% valid when parsed by crawler
  const parsedBack = JSON.parse(safeJsonOutput);
  assert(
    'داده خروجی همچنان یک JSON معتبر است و موتور جستجو داده اصلی را بدون اعوجاج دریافت می‌کند',
    parsedBack.headline === 'تیتر خبر</script><script>alert("JSON-LD-XSS")</script>',
  );

  console.log('\n================================================================');
  console.log(`نتیجه کلی آزمون امنیتی XSS و JSON-LD: ${passed} موفق | ${failed} ناموفق`);
  console.log('================================================================');

  if (failed > 0) process.exit(1);
}

runXssTests().catch((err) => {
  console.error('Fatal XSS test error:', err);
  process.exit(1);
});
