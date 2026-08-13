/**
 * Generates and triggers download of an official Fee Payment Receipt PDF / Print Document.
 */
export function downloadFeeReceipt(receiptData) {
  const {
    receiptNumber = "REC-OFFICIAL",
    studentId = "N/A",
    studentName = "N/A",
    courseName = "N/A",
    semester = "N/A",
    feeTypesPaid = "Course Fee Payment",
    academicAmount = 0,
    sportsAmount = 0,
    examAmount = 0,
    otherAmount = 0,
    amount = 0,
    paymentDate = new Date().toISOString().split("T")[0],
    utrNumber = "N/A",
    transactionNumber = "N/A",
    verifiedAt = new Date().toLocaleDateString(),
    verifiedBy = "ADMIN"
  } = receiptData;

  const totalPaidVal = amount || (academicAmount + sportsAmount + examAmount + otherAmount);
  const formattedAmount = Number(totalPaidVal || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });

  const htmlContent = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Payment Receipt - ${receiptNumber}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800&family=Noto+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@400;600;700;800&family=Noto+Sans:wght@400;600;700;800&display=swap');
    
    * {
      box-sizing: border-box;
    }
    body {
      font-family: 'Noto Sans', 'Noto Sans Devanagari', 'DejaVu Sans', 'Arial Unicode MS', sans-serif;
      margin: 0;
      padding: 40px;
      color: #1e293b;
      background: #fff;
      -webkit-font-smoothing: antialiased;
    }
    .receipt-card {
      max-width: 680px;
      margin: 0 auto;
      border: 2px solid #0f172a;
      border-radius: 12px;
      padding: 36px;
      position: relative;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 20px;
      margin-bottom: 24px;
    }
    .motto {
      font-family: 'Noto Sans Devanagari', 'Noto Sans', 'DejaVu Sans', 'Arial Unicode MS', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 6px;
    }
    .college-title {
      font-size: 24px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 6px 0;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .college-sub {
      font-size: 13px;
      color: #475569;
    }
    .badge {
      display: inline-block;
      background: #2563eb;
      color: #ffffff;
      font-weight: 700;
      font-size: 13px;
      padding: 6px 16px;
      border-radius: 20px;
      margin-top: 14px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background: #f8fafc;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
    }
    .info-item label {
      font-size: 11px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 700;
      display: block;
      margin-bottom: 2px;
    }
    .info-item span {
      font-size: 15px;
      font-weight: 600;
      color: #0f172a;
    }
    .payment-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    .payment-table th, .payment-table td {
      border: 1px solid #cbd5e1;
      padding: 12px 16px;
      text-align: left;
    }
    .payment-table th {
      background: #0f172a;
      color: #ffffff;
      font-size: 13px;
      text-transform: uppercase;
    }
    .payment-table td {
      font-size: 14px;
      color: #1e293b;
    }
    .amount-row td {
      font-size: 16px;
      font-weight: 800;
      background: #eff6ff;
      color: #1e40af;
    }
    .footer-stamps {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px dashed #cbd5e1;
    }
    .watermark {
      position: absolute;
      top: 45%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-25deg);
      font-size: 64px;
      font-weight: 900;
      color: rgba(37, 99, 235, 0.06);
      pointer-events: none;
      white-space: nowrap;
      text-transform: uppercase;
    }
    .seal {
      border: 2px dashed #2563eb;
      color: #2563eb;
      padding: 10px 18px;
      border-radius: 8px;
      font-weight: 800;
      font-size: 12px;
      text-align: center;
      text-transform: uppercase;
    }
    .stamp-box {
      text-align: center;
    }
    .stamp-box p {
      margin-top: 40px;
      font-size: 12px;
      font-weight: 700;
      border-top: 1px solid #0f172a;
      padding-top: 4px;
    }
    @media print {
      body { padding: 0; }
      .receipt-card { border: none; }
    }
  </style>
</head>
<body>
  <div class="receipt-card">
    <div class="watermark">VERIFIED RECEIPT</div>
    <div class="header">
      <div class="motto">"सा विद्या या विमुक्तये"</div>
      <h1 class="college-title">Shiv Kumari Mahavidyalaya</h1>
      <div class="college-sub">Ashapur, Raniganj, Pratapgarh, Uttar Pradesh</div>
      <div class="badge">Official Fee Receipt</div>
    </div>

    <div class="info-grid">
      <div class="info-item">
        <label>Receipt Number</label>
        <span>${receiptNumber}</span>
      </div>
      <div class="info-item">
        <label>Verification Date</label>
        <span>${verifiedAt ? new Date(verifiedAt).toLocaleDateString() : new Date().toLocaleDateString()}</span>
      </div>
      <div class="info-item">
        <label>Student ID</label>
        <span>${studentId}</span>
      </div>
      <div class="info-item">
        <label>Student Name</label>
        <span>${studentName}</span>
      </div>
      <div class="info-item">
        <label>Course & Semester</label>
        <span>${courseName} (${semester})</span>
      </div>
      <div class="info-item">
        <label>Payment Date</label>
        <span>${paymentDate}</span>
      </div>
    </div>

    <table class="payment-table">
      <thead>
        <tr>
          <th>Fee Types Paid</th>
          <th>Transaction Ref / UTR</th>
          <th>Status</th>
          <th style="text-align: right;">Amount (₹)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${feeTypesPaid}</strong>
            ${academicAmount > 0 ? `<br/><small>• Academic Fee: ₹${academicAmount}</small>` : ''}
            ${sportsAmount > 0 ? `<br/><small>• Sports Fee: ₹${sportsAmount}</small>` : ''}
            ${examAmount > 0 ? `<br/><small>• Exam Fee: ₹${examAmount}</small>` : ''}
            ${otherAmount > 0 ? `<br/><small>• Other Fee: ₹${otherAmount}</small>` : ''}
          </td>
          <td>UTR: ${utrNumber || 'N/A'}<br/><small style="color:#64748b;">Txn ID: ${transactionNumber || 'N/A'}</small></td>
          <td><strong style="color: #16a34a;">PAID</strong></td>
          <td style="text-align: right;">₹${formattedAmount}</td>
        </tr>
        <tr class="amount-row">
          <td colspan="3" style="text-align: right;">Total Fee Amount Paid:</td>
          <td style="text-align: right;">₹${formattedAmount}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer-stamps">
      <div class="seal">
        ✔ VERIFIED BY ADMIN<br/>
        <small>${verifiedBy}</small>
      </div>
      <div class="stamp-box">
        <p>Authorized Signatory<br/>SKM Accounts Office</p>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const printWindow = window.open(blobUrl, '_blank');
  if (printWindow) {
    printWindow.focus();
  }
}
