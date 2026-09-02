import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
import { VocabItem, CategoryInfo } from '../types';

export interface PdfGenerationProgress {
  status: 'idle' | 'rendering' | 'compiling' | 'saving' | 'done' | 'error';
  current: number;
  total: number;
  message: string;
}

/**
 * Renders an HTML element or collection of book sections into a clean multi-page PDF book.
 * Uses html2canvas-pro with full support for modern CSS color spaces including oklch/lab.
 */
export async function downloadElementAsPdf(
  elementId: string,
  filename: string = 'JLPT_N5_Vocabulary_Book.pdf',
  onProgress?: (progress: PdfGenerationProgress) => void
): Promise<void> {
  const container = document.getElementById(elementId);
  if (!container) {
    throw new Error(`Element with id "${elementId}" not found.`);
  }

  // Check if the container has distinct book sections (cover, TOC, chapters, appendix)
  const sections = Array.from(
    container.querySelectorAll<HTMLElement>(
      '.book-cover-page, .book-toc-section, .book-chapter-section, .book-appendix-section'
    )
  ).filter((el) => {
    // Only capture visible elements with height > 0
    return el.offsetHeight > 0 && window.getComputedStyle(el).display !== 'none';
  });

  const targetsToRender: HTMLElement[] = sections.length > 0 ? sections : [container];
  const totalSteps = targetsToRender.length;

  onProgress?.({
    status: 'rendering',
    current: 1,
    total: totalSteps + 1,
    message: 'বইয়ের পৃষ্ঠাগুলো প্রস্তুত করা হচ্ছে...',
  });

  const originalDisplay = container.style.display;
  container.style.display = 'block';

  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    let isFirstPage = true;

    for (let i = 0; i < targetsToRender.length; i++) {
      const target = targetsToRender[i];
      const isChapter = target.classList.contains('book-chapter-section');
      const isCover = target.classList.contains('book-cover-page');
      const isToc = target.classList.contains('book-toc-section');
      const isAppendix = target.classList.contains('book-appendix-section');

      let stepLabel = `পৃষ্ঠা ${i + 1}/${totalSteps}`;
      if (isCover) stepLabel = 'কভার পাতা';
      else if (isToc) stepLabel = 'সূচিপত্র';
      else if (isChapter) {
        const chapterTitle = target.querySelector('h3')?.textContent?.trim() || `অধ্যায় ${i}`;
        stepLabel = chapterTitle;
      } else if (isAppendix) stepLabel = 'পরিশিষ্ট';

      onProgress?.({
        status: 'rendering',
        current: i + 1,
        total: totalSteps + 1,
        message: `${stepLabel} রেন্ডার করা হচ্ছে... (${i + 1}/${totalSteps})`,
      });

      // Capture target using html2canvas-pro with oklch support
      const canvas = await html2canvas(target, {
        scale: 1.5, // Crisp rendering for Japanese Kanji and Bengali typography
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1050,
        onclone: (clonedDoc) => {
          // Hide non-printable action buttons (audio buttons, checkboxes etc.)
          const noPrintEls = clonedDoc.querySelectorAll('.no-print, [data-no-print="true"]');
          noPrintEls.forEach((el) => {
            (el as HTMLElement).style.display = 'none';
          });

          // Ensure sharp background and legible typography
          const clonedTarget = clonedDoc.getElementById(target.id) || clonedDoc.querySelector(`.${target.className.split(' ')[0]}`);
          if (clonedTarget) {
            (clonedTarget as HTMLElement).style.backgroundColor = '#ffffff';
            (clonedTarget as HTMLElement).style.color = '#0f172a';
          }
        },
      });

      if (canvas.width === 0 || canvas.height === 0) {
        continue;
      }

      // Convert canvas slice into PDF
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const imgData = canvas.toDataURL('image/jpeg', 0.92);

      let heightLeft = imgHeight;
      let position = 0;

      // First slice of this section
      if (!isFirstPage) {
        pdf.addPage();
      } else {
        isFirstPage = false;
      }

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
      heightLeft -= pageHeight;

      // If section exceeds 1 page (e.g. large chapter), paginate remaining height
      while (heightLeft > 5) {
        position -= pageHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
        heightLeft -= pageHeight;
      }
    }

    onProgress?.({
      status: 'saving',
      current: totalSteps + 1,
      total: totalSteps + 1,
      message: 'পিডিএফ ফাইল সংকলন ও ডাউনলোড সম্পন্ন হচ্ছে...',
    });

    pdf.save(filename);

    onProgress?.({
      status: 'done',
      current: totalSteps + 1,
      total: totalSteps + 1,
      message: 'পিডিএফ সফলভাবে ডাউনলোড হয়েছে!',
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    onProgress?.({
      status: 'error',
      current: 0,
      total: totalSteps + 1,
      message: 'পিডিএফ রেন্ডারিংয়ে সমস্যা হয়েছে। অনুগ্রহ করে "ব্রাউজার প্রিন্ট / Save as PDF" বা "অফলাইন বুক" ব্যবহার করুন।',
    });
    throw error;
  } finally {
    container.style.display = originalDisplay;
  }
}

/**
 * Downloads a standalone, self-contained complete offline HTML book file
 * that can be opened in any browser on any phone/PC, and has 1-click Print to PDF.
 */
export function downloadOfflineHtmlBook(
  categories: CategoryInfo[],
  vocabList: VocabItem[]
): void {
  const dateStr = new Date().toLocaleDateString('bn-BD');
  
  // Group words by category
  const groupedByCategory: Record<string, VocabItem[]> = {};
  categories.forEach((cat) => {
    if (cat.key !== 'all') {
      groupedByCategory[cat.key] = [];
    }
  });

  vocabList.forEach((item) => {
    if (!groupedByCategory[item.categoryKey]) {
      groupedByCategory[item.categoryKey] = [];
    }
    groupedByCategory[item.categoryKey].push(item);
  });

  const activeCategories = categories.filter(
    (c) => c.key !== 'all' && (groupedByCategory[c.key]?.length || 0) > 0
  );

  const htmlContent = `<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>JLPT N5 Japanese-Bengali Vocabulary Book (সম্পূর্ণ শব্দকোষ)</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Noto+Sans+Bengali:wght@400;500;600;700;800&family=Noto+Sans+JP:wght@400;500;700;800&family=Plus+Jakarta+Sans:wght@400;600;700&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Plus Jakarta Sans', 'Noto Sans Bengali', 'Hind Siliguri', 'Noto Sans JP', -apple-system, sans-serif;
      background-color: #f8fafc;
      color: #0f172a;
      line-height: 1.6;
      padding: 24px;
    }
    .container {
      max-width: 960px;
      margin: 0 auto;
      background: #ffffff;
      padding: 40px;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.06);
    }
    .print-bar {
      position: sticky;
      top: 12px;
      z-index: 100;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #0f172a;
      color: #ffffff;
      padding: 12px 24px;
      border-radius: 12px;
      margin-bottom: 24px;
      box-shadow: 0 4px 14px rgba(0,0,0,0.15);
    }
    .print-btn {
      background: #2563eb;
      color: white;
      border: none;
      padding: 8px 20px;
      font-size: 14px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .print-btn:hover {
      background: #1d4ed8;
    }
    .cover-card {
      text-align: center;
      padding: 48px 24px;
      border: 3px double #cbd5e1;
      border-radius: 16px;
      margin-bottom: 40px;
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    }
    .cover-badge {
      display: inline-block;
      padding: 4px 16px;
      background: #e0e7ff;
      color: #3730a3;
      font-size: 12px;
      font-weight: 700;
      border-radius: 9999px;
      letter-spacing: 1px;
      margin-bottom: 16px;
    }
    .cover-title-jp {
      font-size: 32px;
      font-weight: 800;
      color: #1e293b;
      margin-bottom: 8px;
      font-family: 'Noto Sans JP', sans-serif;
    }
    .cover-title-bn {
      font-size: 26px;
      font-weight: 700;
      color: #1d4ed8;
      margin-bottom: 12px;
    }
    .cover-meta {
      font-size: 14px;
      color: #64748b;
      margin-bottom: 24px;
    }
    .intro-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px;
      text-align: left;
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #e2e8f0;
    }
    .intro-box {
      background: #f1f5f9;
      padding: 16px;
      border-radius: 8px;
      font-size: 13px;
    }
    .intro-box h4 {
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 6px;
    }
    .toc-title {
      font-size: 20px;
      font-weight: 700;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 8px;
      margin: 36px 0 16px 0;
    }
    .toc-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 10px;
      margin-bottom: 40px;
    }
    .toc-item {
      display: flex;
      justify-content: space-between;
      padding: 8px 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 13px;
      text-decoration: none;
      color: #334155;
    }
    .toc-item:hover {
      background: #e2e8f0;
      color: #1d4ed8;
    }
    .chapter-section {
      margin-bottom: 48px;
      page-break-inside: avoid;
    }
    .chapter-header {
      background: #1e293b;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 18px;
    }
    .chapter-title {
      font-size: 18px;
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .chapter-badge {
      background: rgba(255,255,255,0.2);
      font-size: 12px;
      padding: 2px 10px;
      border-radius: 9999px;
    }
    .vocab-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13px;
    }
    .vocab-table th {
      background: #f1f5f9;
      color: #475569;
      text-align: left;
      padding: 10px 12px;
      font-weight: 600;
      border-bottom: 2px solid #cbd5e1;
    }
    .vocab-table td {
      padding: 10px 12px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    .vocab-table tr:hover {
      background: #f8fafc;
    }
    .kanji-text {
      font-size: 18px;
      font-weight: 700;
      color: #0f172a;
      font-family: 'Noto Sans JP', sans-serif;
    }
    .hiragana-text {
      font-size: 13px;
      color: #2563eb;
      font-family: 'Noto Sans JP', sans-serif;
      font-weight: 500;
    }
    .romaji-text {
      font-size: 12px;
      color: #64748b;
      font-style: italic;
    }
    .bn-text {
      font-size: 14px;
      font-weight: 600;
      color: #1e293b;
    }
    .example-box {
      font-size: 12px;
      color: #475569;
      background: #f8fafc;
      padding: 6px 10px;
      border-radius: 6px;
      border-left: 3px solid #3b82f6;
      margin-top: 4px;
    }
    .example-jp {
      font-family: 'Noto Sans JP', sans-serif;
      color: #1e293b;
      font-weight: 500;
    }
    .example-bn {
      color: #475569;
      margin-top: 2px;
    }
    .checkbox-col {
      width: 32px;
      text-align: center;
    }
    .checkbox-box {
      width: 16px;
      height: 16px;
      border: 1px solid #cbd5e1;
      border-radius: 3px;
      display: inline-block;
    }
    @media print {
      body {
        background: #ffffff;
        padding: 0;
      }
      .container {
        box-shadow: none;
        padding: 0;
        max-width: 100%;
      }
      .print-bar {
        display: none !important;
      }
      .cover-card {
        page-break-after: always;
        break-after: page;
        min-height: 90vh;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      .chapter-section {
        page-break-before: always;
        break-before: page;
      }
      tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="print-bar">
      <div>
        <strong>JLPT N5 জাপানি শব্দকোষ বই</strong> (মোট ${vocabList.length} টি শব্দ)
      </div>
      <button class="print-btn" onclick="window.print()">
        🖨️ প্রিন্ট করুন / Save as PDF
      </button>
    </div>

    <!-- Cover Page -->
    <div class="cover-card">
      <span class="cover-badge">JLPT N5 VOCABULARY BOOK</span>
      <div class="cover-title-jp">日本語能力試験 N5 単語完全版</div>
      <h1 class="cover-title-bn">JLPT N5 জাপানি-বাংলা সম্পূর্ণ শব্দকোষ ও ব্যাকরণ নির্দেশিকা</h1>
      <p class="cover-meta">
        মোট শব্দভাণ্ডার: <strong>${vocabList.length}</strong> টি শব্দ • <strong>${activeCategories.length}</strong> টি অধ্যায় • বাংলা অনুবাদ ও উদাহরণ বাক্যসহ
      </p>
      
      <div class="intro-grid">
        <div class="intro-box">
          <h4>📖 বইটি কীভাবে পড়বেন</h4>
          <p>প্রতিটি শব্দের কাঞ্জি, হিরাগানা রিডিং, রোমাজি উচ্চারণ এবং সঠিক বাংলা অর্থ দেওয়া হয়েছে। ডানপাশে মুখস্ত করার চেকবক্স দেওয়া আছে।</p>
        </div>
        <div class="intro-box">
          <h4>💡 উদাহরণ বাক্য অনুশীলন</h4>
          <p>প্রতিটি শব্দ কীভাবে বাক্যে ব্যবহৃত হয় তা সহজে আয়ত্ত করার জন্য জাপানি এবং বাংলা অর্থসহ বাস্তব উদাহরণ বাক্য সংযুক্ত রয়েছে।</p>
        </div>
        <div class="intro-box">
          <h4>🎯 JLPT N5 এর প্রস্তুতি</h4>
          <p>এই শব্দভাণ্ডার নিয়মিত অনুশীলন ও রিভিশন দিলে JLPT N5 পরীক্ষায় ৯০%+ শব্দ কমন পড়বে ইনশাআল্লাহ।</p>
        </div>
      </div>
    </div>

    <!-- Table of Contents -->
    <h2 class="toc-title">📑 সূচিপত্র (Table of Contents)</h2>
    <div class="toc-grid">
      ${activeCategories
        .map(
          (cat, idx) => `
        <a href="#chapter-${cat.key}" class="toc-item">
          <span>${idx + 1}. ${cat.icon} ${cat.nameBn}</span>
          <strong>${groupedByCategory[cat.key]?.length || 0}</strong>
        </a>
      `
        )
        .join('')}
    </div>

    <!-- Chapters & Word Tables -->
    ${activeCategories
      .map((cat, idx) => {
        const items = groupedByCategory[cat.key] || [];
        return `
        <section id="chapter-${cat.key}" class="chapter-section">
          <div class="chapter-header">
            <div class="chapter-title">
              <span>${cat.icon}</span>
              <span>অধ্যায় ${idx + 1}: ${cat.nameBn} (${cat.nameJp})</span>
            </div>
            <span class="chapter-badge">${items.length} টি শব্দ</span>
          </div>

          <table class="vocab-table">
            <thead>
              <tr>
                <th style="width: 38px;">#</th>
                <th style="width: 140px;">কাঞ্জি ও হিরাগানা</th>
                <th style="width: 120px;">রোমাজি</th>
                <th style="width: 170px;">বাংলা অর্থ</th>
                <th>ব্যবহারিক উদাহরণ বাক্য</th>
                <th class="checkbox-col">শিখা</th>
              </tr>
            </thead>
            <tbody>
              ${items
                .map(
                  (item) => `
                <tr>
                  <td style="color: #94a3b8; font-size: 11px;">${item.id}</td>
                  <td>
                    <div class="kanji-text">${item.kanji}</div>
                    <div class="hiragana-text">${item.hiragana}</div>
                  </td>
                  <td>
                    <div class="romaji-text">${item.romaji}</div>
                  </td>
                  <td>
                    <div class="bn-text">${item.bn}</div>
                  </td>
                  <td>
                    ${
                      item.exampleJp
                        ? `
                      <div class="example-box">
                        <div class="example-jp">${item.exampleJp}</div>
                        ${item.exampleRomaji ? `<div style="font-size: 11px; color: #64748b; font-style: italic;">${item.exampleRomaji}</div>` : ''}
                        <div class="example-bn">${item.exampleBn || ''}</div>
                      </div>
                    `
                        : `<span style="color: #94a3b8;">-</span>`
                    }
                  </td>
                  <td class="checkbox-col">
                    <span class="checkbox-box"></span>
                  </td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        </section>
      `;
      })
      .join('')}

    <!-- Appendix / Tips -->
    <div style="margin-top: 40px; padding: 24px; background: #f1f5f9; border-radius: 12px; font-size: 13px; text-align: center; color: #475569;">
      <h3 style="color: #0f172a; margin-bottom: 8px;">JLPT N5 জাপানি শব্দকোষ সম্পন্ন!</h3>
      <p>নিয়মিত অনুশীলন করুন এবং ফ্লিপকার্ড ও কুইজের মাধ্যমে আপনার অগ্রগতি পরীক্ষা করুন। শুভকামনা আপনার জাপানি ভাষা শিক্ষার যাত্রায়!</p>
      <p style="margin-top: 8px; font-size: 11px; color: #94a3b8;">তৈরি ও ডাউনলোড তারিখ: ${dateStr}</p>
    </div>
  </div>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'JLPT_N5_Japanese_Bengali_Vocabulary_Book.html');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
