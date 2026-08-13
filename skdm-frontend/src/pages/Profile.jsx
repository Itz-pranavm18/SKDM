import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentFeeApi } from '../services/api';
import { downloadFeeReceipt } from '../utils/pdfReceiptGenerator';
import Icon from '../components/Icons';

export default function Profile() {
  const { user, logout } = useAuth();
  const [semesterFees, setSemesterFees] = useState([]);
  const [feeOverview, setFeeOverview] = useState(null);
  const [activeSemIndex, setActiveSemIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Selected fee items for payment
  const [selectedFeeTypes, setSelectedFeeTypes] = useState({
    payAcademic: false,
    paySports: false,
    payExam: false,
    payOther: false,
  });

  // Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentModalStep, setPaymentModalStep] = useState(1); // 1 = Bank & QR Details, 2 = Submit Txn Form
  const [paymentForm, setPaymentForm] = useState({
    paymentDate: new Date().toISOString().split('T')[0],
    utrNumber: '',
    transactionNumber: '',
    screenshotUrl: '',
    remarks: '',
  });

  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ type: '', text: '' });
  const [viewingReceipt, setViewingReceipt] = useState(null);

  const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'];

  useEffect(() => {
    loadStudentData();
  }, []);

  const loadStudentData = async () => {
    setLoading(true);
    try {
      const [dashRes, overviewRes] = await Promise.all([
        studentFeeApi.getFeeDashboard(),
        studentFeeApi.getFeeDetails(),
      ]);

      if (dashRes?.data) {
        setSemesterFees(dashRes.data);
        const currSemName = user?.currentSemester || 'Semester 1';
        const foundIdx = dashRes.data.findIndex((s) => s.semester === currSemName);
        if (foundIdx >= 0) setActiveSemIndex(foundIdx);
      }

      if (overviewRes?.data) {
        setFeeOverview(overviewRes.data);
      }
    } catch (err) {
      console.error('Failed to load student fee data:', err);
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (type, text) => {
    setAlertMsg({ type, text });
    setTimeout(() => setAlertMsg({ type: '', text: '' }), 5000);
  };

  const currentSemFee = semesterFees[activeSemIndex] || null;

  // Calculate total selected for payment
  const getSelectedTotal = () => {
    if (!currentSemFee) return 0;
    let total = 0;
    if (selectedFeeTypes.payAcademic && !currentSemFee.academicPaid) total += (currentSemFee.academicFee || 0);
    if (selectedFeeTypes.paySports && !currentSemFee.sportsPaid) total += (currentSemFee.sportsFee || 0);
    if (selectedFeeTypes.payExam && !currentSemFee.examPaid) total += (currentSemFee.examFee || 0);
    if (selectedFeeTypes.payOther && !currentSemFee.otherPaid) total += (currentSemFee.otherFee || 0);
    return total;
  };

  const handleOpenPaymentModal = () => {
    if (!currentSemFee) return;

    if (currentSemFee.locked) {
      showAlert('error', currentSemFee.lockedReason || 'Please clear pending fees from previous semesters first.');
      return;
    }

    if (!selectedFeeTypes.payAcademic && !selectedFeeTypes.paySports && !selectedFeeTypes.payExam && !selectedFeeTypes.payOther) {
      showAlert('error', 'Please select at least one fee type to pay before proceeding.');
      return;
    }

    setPaymentForm({
      paymentDate: new Date().toISOString().split('T')[0],
      utrNumber: '',
      transactionNumber: '',
      screenshotUrl: '',
      remarks: '',
    });
    setPaymentModalStep(1);
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!currentSemFee) return;

    if (!paymentForm.utrNumber || !paymentForm.transactionNumber) {
      showAlert('error', 'Please enter your UTR Number and Transaction ID.');
      return;
    }

    setSubmittingPayment(true);
    setAlertMsg({ type: '', text: '' });

    try {
      const res = await studentFeeApi.submitPaymentRequest({
        semesterFeeId: currentSemFee.id,
        semester: currentSemFee.semester,
        payAcademic: selectedFeeTypes.payAcademic && !currentSemFee.academicPaid,
        paySports: selectedFeeTypes.paySports && !currentSemFee.sportsPaid,
        payExam: selectedFeeTypes.payExam && !currentSemFee.examPaid,
        payOther: selectedFeeTypes.payOther && !currentSemFee.otherPaid,
        amount: getSelectedTotal(),
        paymentDate: paymentForm.paymentDate,
        utrNumber: paymentForm.utrNumber,
        transactionNumber: paymentForm.transactionNumber,
        screenshotUrl: paymentForm.screenshotUrl,
        remarks: paymentForm.remarks,
      });

      if (res?.data) {
        showAlert('success', 'Fee payment request submitted successfully! Awaiting Admin verification.');
        setShowPaymentModal(false);
        setSelectedFeeTypes({
          payAcademic: false,
          paySports: false,
          payExam: false,
          payOther: false,
        });
        loadStudentData();
      }
    } catch (err) {
      showAlert('error', err.message || 'Failed to submit payment verification request.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const studentId = feeOverview?.studentId || user?.studentId || user?.username || 'STU000000';
  const courseName = feeOverview?.courseName || user?.courseName || 'BA';
  const currentSemester = (semesterFees && semesterFees.length > 0)
    ? semesterFees[semesterFees.length - 1].semester
    : (feeOverview?.currentSemester || user?.currentSemester || 'Semester 1');

  // Overall fee stats
  const overallTotal = semesterFees.reduce((acc, curr) => acc + (curr.totalFee || 0), 0);
  const overallPaid = semesterFees.reduce((acc, curr) => acc + (curr.paidFee || 0), 0);
  const overallRemaining = Math.max(0, overallTotal - overallPaid);

  return (
    <div className="profile-page" style={{ padding: '30px 0', background: '#f8fafc', minHeight: '85vh' }}>
      <div className="container">

        {/* Student Dashboard Header */}
        <div style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#fff',
          borderRadius: 16,
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 20,
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.15)',
          marginBottom: 30
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: '#2563eb',
              color: '#fff',
              fontSize: 32,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '3px solid rgba(255, 255, 255, 0.2)'
            }}>
              {user?.firstName ? user.firstName[0].toUpperCase() : 'S'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <h2 style={{ fontSize: 24, fontWeight: 800, margin: 0, color: '#fff' }}>
                  {user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`}
                </h2>
                <span style={{
                  background: 'rgba(37, 99, 235, 0.3)',
                  color: '#60a5fa',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  padding: '2px 10px',
                  borderRadius: 12,
                  fontSize: 12,
                  fontWeight: 700
                }}>
                  STUDENT PORTAL
                </span>
              </div>
              <div style={{ margin: '8px 0 0 0', color: '#94a3b8', fontSize: 14, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <span>Student ID: <strong style={{ color: '#fbbf24', fontSize: 15 }}>{studentId}</strong></span>
                <span>Course: <strong style={{ color: '#ffffff', fontSize: 15 }}>{courseName}</strong></span>
                <span>Current Semester: <strong style={{ color: '#38bdf8', fontSize: 15 }}>{currentSemester}</strong></span>
              </div>
            </div>
          </div>

          <button onClick={logout} className="btn" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', borderRadius: 8, padding: '10px 18px', fontWeight: 600 }}>
            <Icon name="logout" /> Sign Out
          </button>
        </div>

        {/* Global Alert Notification */}
        {alertMsg.text && (
          <div className={`auth-alert ${alertMsg.type}`} style={{ marginBottom: 24 }}>
            <Icon name={alertMsg.type === 'success' ? 'check' : 'alert-circle'} />
            <span>{alertMsg.text}</span>
          </div>
        )}

        {/* Overall Fee Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 30 }}>
          <div style={{ background: '#fff', borderRadius: 12, padding: 22, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 6 }}>Total Cumulative Fee</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#0f172a' }}>
              ₹{Number(overallTotal).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: 12, color: '#64748b' }}>Across initialized semesters</span>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: 22, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: 6 }}>Total Paid Amount</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#16a34a' }}>
              ₹{Number(overallPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: 12, color: '#16a34a' }}>✔ Verified payments</span>
          </div>

          <div style={{ background: '#fff', borderRadius: 12, padding: 22, border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: 6 }}>Remaining Balance</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: '#dc2626' }}>
              ₹{Number(overallRemaining).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <span style={{ fontSize: 12, color: '#dc2626' }}>Outstanding balance due</span>
          </div>
        </div>

        {/* Semester Navigation Tabs & Fee Selection */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #e2e8f0', marginBottom: 30 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
              📚 Semester-wise Fee Records & Payment Portal
            </h3>
            <button onClick={loadStudentData} className="btn btn-outline-sm">
              <Icon name="refresh" /> Refresh Data
            </button>
          </div>

          {/* Semester Tabs */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
            {semesters.map((semName) => {
              const semData = semesterFees.find((s) => s.semester === semName);
              const isActive = activeSemIndex === semesterFees.findIndex((s) => s.semester === semName);
              const isLocked = semData?.locked;
              const isPaid = semData?.status === 'PAID';

              return (
                <button
                  key={semName}
                  onClick={() => {
                    const targetIdx = semesterFees.findIndex((s) => s.semester === semName);
                    if (targetIdx >= 0) setActiveSemIndex(targetIdx);
                  }}
                  disabled={!semData}
                  style={{
                    background: isActive ? '#0f172a' : !semData ? '#f1f5f9' : '#ffffff',
                    color: isActive ? '#ffffff' : !semData ? '#94a3b8' : '#334155',
                    border: isActive ? '1px solid #0f172a' : '1px solid #cbd5e1',
                    borderRadius: 20,
                    padding: '8px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: !semData ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    opacity: !semData ? 0.6 : 1
                  }}
                >
                  <span>{semName}</span>
                  {isPaid ? (
                    <span style={{ background: '#16a34a', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10 }}>PAID</span>
                  ) : isLocked ? (
                    <span style={{ background: '#f59e0b', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10 }}>🔒 LOCKED</span>
                  ) : semData ? (
                    <span style={{ background: '#ef4444', color: '#fff', borderRadius: 10, padding: '1px 6px', fontSize: 10 }}>DUE</span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading semester fee details...</div>
          ) : !currentSemFee ? (
            <div style={{ textAlign: 'center', padding: 40, background: '#f8fafc', borderRadius: 8 }}>
              <p style={{ color: '#64748b', margin: 0 }}>No fee structure initialized for this semester yet.</p>
            </div>
          ) : (
            <div>
              {/* REQUIREMENT 10: PENDING FEE LOCK RULE BANNER */}
              {currentSemFee.locked && (
                <div style={{
                  background: '#fef3c7',
                  border: '1px solid #f59e0b',
                  borderRadius: 10,
                  padding: '16px 20px',
                  marginBottom: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  color: '#92400e'
                }}>
                  <span style={{ fontSize: 24 }}>🔒</span>
                  <div>
                    <h4 style={{ margin: '0 0 4px 0', fontSize: 15, fontWeight: 800 }}>Payment Locked for {currentSemFee.semester}</h4>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600 }}>{currentSemFee.lockedReason}</p>
                  </div>
                </div>
              )}

              {/* Semester Overview Header Card */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: 12,
                padding: 20,
                marginBottom: 24,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: 16
              }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Semester Total Fee</label>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#0f172a' }}>₹{Number(currentSemFee.totalFee).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase' }}>Total Amount Paid</label>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#16a34a' }}>₹{Number(currentSemFee.paidFee).toLocaleString('en-IN')}</div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase' }}>Remaining Fee</label>
                  <div style={{ fontSize: 20, fontWeight: 800, color: currentSemFee.remainingFee <= 0 ? '#16a34a' : '#dc2626' }}>
                    ₹{Number(currentSemFee.remainingFee).toLocaleString('en-IN')}
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Fee Status</label>
                  <div>
                    {currentSemFee.status === 'PAID' ? (
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 800 }}>
                        ✔ FULL PAID
                      </span>
                    ) : currentSemFee.status === 'PARTIAL' ? (
                      <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 800 }}>
                        PARTIAL PAID
                      </span>
                    ) : (
                      <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 800 }}>
                        PENDING
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ITEMISED FIXED FEE SELECTION */}
              <div style={{ marginBottom: 32 }}>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
                  💳 Select Fee Types to Pay ({currentSemFee.semester})
                </h4>
                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 18 }}>
                  Amounts for each fee type are fixed. Select the fee types you wish to pay, then click <strong>"Pay Fee / Request Receipt"</strong> to view bank details and submit your payment UTR number for Admin verification.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 20 }}>

                  {/* Academic Fee */}
                  <div style={{
                    border: currentSemFee.academicPaid ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
                    background: currentSemFee.academicPaid ? '#f0fdf4' : '#ffffff',
                    borderRadius: 10,
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>Academic Fee</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
                        ₹{Number(currentSemFee.academicFee).toLocaleString('en-IN')}
                      </div>
                    </div>
                    {currentSemFee.academicPaid ? (
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                        PAID
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={selectedFeeTypes.payAcademic}
                        disabled={currentSemFee.locked}
                        onChange={(e) => setSelectedFeeTypes({ ...selectedFeeTypes, payAcademic: e.target.checked })}
                        style={{ width: 20, height: 20, cursor: currentSemFee.locked ? 'not-allowed' : 'pointer' }}
                      />
                    )}
                  </div>

                  {/* Sports Fee */}
                  <div style={{
                    border: currentSemFee.sportsPaid ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
                    background: currentSemFee.sportsPaid ? '#f0fdf4' : '#ffffff',
                    borderRadius: 10,
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>Sports Fee</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
                        ₹{Number(currentSemFee.sportsFee).toLocaleString('en-IN')}
                      </div>
                    </div>
                    {currentSemFee.sportsPaid ? (
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                        PAID
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={selectedFeeTypes.paySports}
                        disabled={currentSemFee.locked}
                        onChange={(e) => setSelectedFeeTypes({ ...selectedFeeTypes, paySports: e.target.checked })}
                        style={{ width: 20, height: 20, cursor: currentSemFee.locked ? 'not-allowed' : 'pointer' }}
                      />
                    )}
                  </div>

                  {/* Exam Fee */}
                  <div style={{
                    border: currentSemFee.examPaid ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
                    background: currentSemFee.examPaid ? '#f0fdf4' : '#ffffff',
                    borderRadius: 10,
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>Exam Fee</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
                        ₹{Number(currentSemFee.examFee).toLocaleString('en-IN')}
                      </div>
                    </div>
                    {currentSemFee.examPaid ? (
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                        PAID
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={selectedFeeTypes.payExam}
                        disabled={currentSemFee.locked}
                        onChange={(e) => setSelectedFeeTypes({ ...selectedFeeTypes, payExam: e.target.checked })}
                        style={{ width: 20, height: 20, cursor: currentSemFee.locked ? 'not-allowed' : 'pointer' }}
                      />
                    )}
                  </div>

                  {/* Other Fee */}
                  <div style={{
                    border: currentSemFee.otherPaid ? '1px solid #bbf7d0' : '1px solid #cbd5e1',
                    background: currentSemFee.otherPaid ? '#f0fdf4' : '#ffffff',
                    borderRadius: 10,
                    padding: 16,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ fontWeight: 700, color: '#0f172a' }}>Other Fee</div>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#2563eb', marginTop: 4 }}>
                        ₹{Number(currentSemFee.otherFee).toLocaleString('en-IN')}
                      </div>
                    </div>
                    {currentSemFee.otherPaid ? (
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                        PAID
                      </span>
                    ) : (
                      <input
                        type="checkbox"
                        checked={selectedFeeTypes.payOther}
                        disabled={currentSemFee.locked}
                        onChange={(e) => setSelectedFeeTypes({ ...selectedFeeTypes, payOther: e.target.checked })}
                        style={{ width: 20, height: 20, cursor: currentSemFee.locked ? 'not-allowed' : 'pointer' }}
                      />
                    )}
                  </div>

                </div>

                {/* Total Payment Bar & Trigger Modal Button */}
                <div style={{
                  background: '#f8fafc',
                  padding: 18,
                  borderRadius: 10,
                  border: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 12
                }}>
                  <div>
                    <span style={{ fontSize: 13, color: '#64748b' }}>Total Selected Payment Amount:</span>
                    <div style={{ fontSize: 24, fontWeight: 900, color: '#16a34a' }}>
                      ₹{Number(getSelectedTotal()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleOpenPaymentModal}
                    disabled={currentSemFee.locked || getSelectedTotal() <= 0}
                    className="btn btn-primary"
                    style={{
                      padding: '12px 24px',
                      fontSize: 15,
                      fontWeight: 800,
                      background: currentSemFee.locked || getSelectedTotal() <= 0 ? '#94a3b8' : '#2563eb',
                      borderColor: currentSemFee.locked || getSelectedTotal() <= 0 ? '#94a3b8' : '#2563eb',
                      cursor: currentSemFee.locked || getSelectedTotal() <= 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    💳 Pay Fee / Request Receipt
                  </button>
                </div>
              </div>

              {/* PAYMENT VERIFICATION REQUESTS & RECEIPTS HISTORY */}
              <div>
                <h4 style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', marginBottom: 14 }}>
                  📋 Payment Requests & Receipts ({currentSemFee.semester})
                </h4>

                {!feeOverview?.paymentRequests || feeOverview.paymentRequests.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 28, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                    <p style={{ margin: 0, color: '#64748b', fontSize: 14 }}>No payment verification requests submitted yet.</p>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: 12, textTransform: 'uppercase' }}>
                          <th style={{ padding: '10px 14px' }}>Date</th>
                          <th style={{ padding: '10px 14px' }}>Semester & Fee Types</th>
                          <th style={{ padding: '10px 14px' }}>Total Amount (₹)</th>
                          <th style={{ padding: '10px 14px' }}>UTR / Txn Ref</th>
                          <th style={{ padding: '10px 14px' }}>Verification Status</th>
                          <th style={{ padding: '10px 14px', textAlign: 'right' }}>Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {feeOverview.paymentRequests.map((req) => (
                          <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                            <td style={{ padding: '12px 14px', color: '#0f172a' }}>{req.paymentDate}</td>
                            <td style={{ padding: '12px 14px' }}>
                              <strong style={{ color: '#2563eb' }}>{req.semester || currentSemFee.semester}</strong>
                              <div style={{ fontSize: 12, color: '#475569' }}>{req.feeTypesPaid || 'Course Fee'}</div>
                            </td>
                            <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                              ₹{Number(req.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </td>
                            <td style={{ padding: '12px 14px', color: '#475569' }}>
                              <div>UTR: <strong>{req.utrNumber}</strong></div>
                              <small style={{ color: '#94a3b8' }}>Txn: {req.transactionNumber}</small>
                            </td>
                            <td style={{ padding: '12px 14px' }}>
                              {req.status === 'VERIFIED' ? (
                                <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                                  ✔ VERIFIED
                                </span>
                              ) : req.status === 'REJECTED' ? (
                                <div>
                                  <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                                    ✖ REJECTED
                                  </span>
                                  {req.rejectionReason && (
                                    <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4, fontStyle: 'italic' }}>
                                      Reason: {req.rejectionReason}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span style={{ background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                                  ⏳ PENDING VERIFICATION
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                              {req.status === 'VERIFIED' ? (
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                  <button
                                    type="button"
                                    onClick={() => setViewingReceipt(req)}
                                    className="btn-sm btn-outline"
                                    style={{ padding: '5px 10px', fontSize: 12, fontWeight: 600 }}
                                  >
                                    👁️ View
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => downloadFeeReceipt({
                                      receiptNumber: req.receiptNumber || 'REC-OFFICIAL',
                                      studentId: studentId,
                                      studentName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`,
                                      courseName: courseName,
                                      semester: req.semester || currentSemFee.semester,
                                      feeTypesPaid: req.feeTypesPaid || 'Course Fee',
                                      academicAmount: req.academicAmount,
                                      sportsAmount: req.sportsAmount,
                                      examAmount: req.examAmount,
                                      otherAmount: req.otherAmount,
                                      amount: req.amount,
                                      paymentDate: req.paymentDate,
                                      utrNumber: req.utrNumber,
                                      transactionNumber: req.transactionNumber,
                                      verifiedAt: req.verifiedAt || req.paymentDate,
                                      verifiedBy: req.verifiedBy || "ADMIN"
                                    })}
                                    className="btn-sm"
                                    style={{ background: '#2563eb', color: '#fff', padding: '5px 10px', fontSize: 12, fontWeight: 600, borderRadius: 6 }}
                                  >
                                    📥 Download PDF
                                  </button>
                                </div>
                              ) : (
                                <span style={{ fontSize: 12, color: '#94a3b8' }}>Available after Admin verification</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

      </div>

      {/* PAYMENT & RECEIPT REQUEST MODAL (STEP 1: BANK & QR DETAILS, STEP 2: TRANSACTION SUBMISSION) */}
      {showPaymentModal && currentSemFee && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 560, width: '100%', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button
              onClick={() => setShowPaymentModal(false)}
              style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}
            >
              ✕
            </button>

            {/* STEP 1: DISPLAY ONLY COLLEGE PAYMENT DETAILS & QR CODE */}
            {paymentModalStep === 1 && (
              <div>
                <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: 14, marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#475569', letterSpacing: 0.5 }}>"सा विद्या या विमुक्तये"</div>
                  <h3 style={{ fontSize: 22, fontWeight: 900, color: '#0f172a', margin: '4px 0 2px 0' }}>
                    🏛️ Shiv Kumari Mahavidyalaya
                  </h3>
                  <div style={{ fontSize: 13, color: '#64748b' }}>Ashapur, Raniganj, Pratapgarh, Uttar Pradesh</div>
                  <div style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', fontSize: 12, fontWeight: 800, padding: '3px 12px', borderRadius: 12, marginTop: 8 }}>
                    OFFICIAL FEE PAYMENT PORTAL
                  </div>
                </div>

                {/* Selected Amount Summary */}
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: 16, marginBottom: 20, textAlign: 'center' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#166534', textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Amount to Pay</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: '#15803d', margin: '4px 0' }}>
                    ₹{Number(getSelectedTotal()).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </div>
                  <div style={{ fontSize: 13, color: '#166534', fontWeight: 600 }}>
                    {currentSemFee.semester} • {Object.keys(selectedFeeTypes).filter(k => selectedFeeTypes[k]).map(k => k.replace('pay', '') + ' Fee').join(', ')}
                  </div>
                </div>

                {/* Bank Account Details */}
                <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: 12, padding: 18, marginBottom: 20 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    🏦 College Bank & UPI Transfer Details
                  </h4>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 14 }}>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>College Account Holder Name</span>
                      <strong style={{ color: '#0f172a', fontSize: 15 }}>Shiv Kumari Mahavidyalaya</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Bank Account Number</span>
                      <div style={{ fontSize: 17, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace', letterSpacing: 0.5 }}>
                        91827364501928
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>IFSC Code</span>
                      <div style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                        SKMB0001029
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Official UPI ID</span>
                      <div style={{ fontSize: 15, fontWeight: 800, color: '#2563eb' }}>
                        skmahavidyalaya@upi
                      </div>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, textTransform: 'uppercase', display: 'block' }}>Bank & Branch Name</span>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>
                        State Bank of India, Raniganj Branch
                      </div>
                    </div>
                  </div>
                </div>

                {/* Dummy QR Code Image View */}
                <div style={{ textAlign: 'center', background: '#eff6ff', border: '1px dashed #bfdbfe', borderRadius: 12, padding: 18, marginBottom: 24 }}>
                  <img
                    src="/college_qr_code.png"
                    alt="College Fee Payment QR Code"
                    style={{ width: 140, height: 140, borderRadius: 8, border: '2px solid #fff', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                  />
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#1e40af', marginTop: 10 }}>
                    📲 Scan QR Code using Google Pay, PhonePe, Paytm, or BHIM UPI
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPaymentModalStep(2)}
                  className="btn btn-primary btn-block"
                  style={{ padding: '14px 20px', fontSize: 16, fontWeight: 800, background: '#16a34a', borderColor: '#16a34a', width: '100%' }}
                >
                  📝 Request for Fee Receipt ➔
                </button>
              </div>
            )}

            {/* STEP 2: FORM TO SUBMIT TRANSACTION DETAILS */}
            {paymentModalStep === 2 && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, borderBottom: '2px solid #e2e8f0', paddingBottom: 12 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    📝 Request for Fee Receipt
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPaymentModalStep(1)}
                    style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontWeight: 700, color: '#475569', cursor: 'pointer' }}
                  >
                    ⬅ Back to Bank Details
                  </button>
                </div>

                <p style={{ fontSize: 13, color: '#64748b', marginBottom: 18 }}>
                  Enter the transaction ID and payment details below after completing your transfer for <strong>{currentSemFee.semester}</strong>.
                </p>

                <div style={{ background: '#f8fafc', padding: 12, borderRadius: 8, border: '1px solid #e2e8f0', marginBottom: 18, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                  <span>Requested Amount: <strong style={{ color: '#16a34a' }}>₹{Number(getSelectedTotal()).toLocaleString('en-IN')}</strong></span>
                  <span>Semester: <strong>{currentSemFee.semester}</strong></span>
                </div>

                <form onSubmit={handlePaymentSubmit} className="auth-form">
                  <div className="form-group mb-3">
                    <label>UTR Number (Bank Reference / UPI Ref ID) *</label>
                    <input
                      type="text"
                      value={paymentForm.utrNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, utrNumber: e.target.value })}
                      placeholder="e.g. UTR9182736450"
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label>Transaction ID / Reference Number *</label>
                    <input
                      type="text"
                      value={paymentForm.transactionNumber}
                      onChange={(e) => setPaymentForm({ ...paymentForm, transactionNumber: e.target.value })}
                      placeholder="e.g. TXN987654321"
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label>Payment Date *</label>
                    <input
                      type="date"
                      value={paymentForm.paymentDate}
                      onChange={(e) => setPaymentForm({ ...paymentForm, paymentDate: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label>Optional Remarks / Payment Notes</label>
                    <input
                      type="text"
                      value={paymentForm.remarks}
                      onChange={(e) => setPaymentForm({ ...paymentForm, remarks: e.target.value })}
                      placeholder="e.g. Paid via PhonePe / SBI Online"
                    />
                  </div>

                  <div style={{ display: 'flex', gap: 12 }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: 12, fontWeight: 800, background: '#16a34a', borderColor: '#16a34a' }} disabled={submittingPayment}>
                      {submittingPayment ? 'Submitting Request...' : '✔ Submit Verification Request'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={() => setPaymentModalStep(1)}>
                      Back
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* VIEW RECEIPT MODAL DIALOG */}
      {viewingReceipt && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div style={{ background: '#fff', borderRadius: 16, maxWidth: 550, width: '100%', padding: 28, boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)', position: 'relative' }}>
            <button
              onClick={() => setViewingReceipt(null)}
              style={{ position: 'absolute', top: 16, right: 16, border: 'none', background: 'none', fontSize: 20, cursor: 'pointer', color: '#64748b' }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', borderBottom: '2px solid #e2e8f0', paddingBottom: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', letterSpacing: 1 }}>SHIV KUMARI MAHAVIDYALAYA</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '4px 0' }}>Official Fee Payment Receipt</h3>
              <div style={{ fontSize: 13, color: '#2563eb', fontWeight: 700 }}>{viewingReceipt.receiptNumber || 'REC-OFFICIAL'}</div>
            </div>

            <div style={{ background: '#f8fafc', borderRadius: 10, padding: 16, marginBottom: 20, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Student Name</span>
                  <strong style={{ color: '#0f172a' }}>{user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Student ID</span>
                  <strong style={{ color: '#2563eb' }}>{studentId}</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Course & Semester</span>
                  <strong style={{ color: '#0f172a' }}>{courseName} ({viewingReceipt.semester || currentSemFee?.semester})</strong>
                </div>
                <div>
                  <span style={{ fontSize: 11, color: '#64748b', fontWeight: 700, display: 'block', textTransform: 'uppercase' }}>Payment Date</span>
                  <strong style={{ color: '#0f172a' }}>{new Date(viewingReceipt.paymentDate).toLocaleDateString()}</strong>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Fee Breakdown Paid</label>
              <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: 12 }}>
                <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: 6 }}>{viewingReceipt.feeTypesPaid || 'Course Fee'}</div>
                {viewingReceipt.academicAmount > 0 && <div style={{ fontSize: 13, color: '#475569' }}>• Academic Fee: ₹{viewingReceipt.academicAmount}</div>}
                {viewingReceipt.sportsAmount > 0 && <div style={{ fontSize: 13, color: '#475569' }}>• Sports Fee: ₹{viewingReceipt.sportsAmount}</div>}
                {viewingReceipt.examAmount > 0 && <div style={{ fontSize: 13, color: '#475569' }}>• Exam Fee: ₹{viewingReceipt.examAmount}</div>}
                {viewingReceipt.otherAmount > 0 && <div style={{ fontSize: 13, color: '#475569' }}>• Other Fee: ₹{viewingReceipt.otherAmount}</div>}
              </div>
            </div>

            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 16, borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <span style={{ fontWeight: 700, color: '#166534' }}>Total Amount Paid:</span>
              <span style={{ fontSize: 22, fontWeight: 900, color: '#15803d' }}>
                ₹{Number(viewingReceipt.amount || viewingReceipt.totalPaid).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => downloadFeeReceipt({
                  receiptNumber: viewingReceipt.receiptNumber || 'REC-OFFICIAL',
                  studentId: studentId,
                  studentName: user?.fullName || `${user?.firstName || ''} ${user?.lastName || ''}`,
                  courseName: courseName,
                  semester: viewingReceipt.semester || currentSemFee?.semester,
                  feeTypesPaid: viewingReceipt.feeTypesPaid || 'Course Fee',
                  academicAmount: viewingReceipt.academicAmount,
                  sportsAmount: viewingReceipt.sportsAmount,
                  examAmount: viewingReceipt.examAmount,
                  otherAmount: viewingReceipt.otherAmount,
                  amount: viewingReceipt.amount || viewingReceipt.totalPaid,
                  paymentDate: new Date(viewingReceipt.paymentDate).toLocaleDateString(),
                  verifiedAt: viewingReceipt.verifiedAt || viewingReceipt.paymentDate,
                  verifiedBy: viewingReceipt.verifiedBy || "SYSTEM / ACCOUNTS"
                })}
                className="btn btn-primary"
                style={{ flex: 1, padding: '12px', fontWeight: 800 }}
              >
                📥 Download PDF Receipt
              </button>
              <button onClick={() => setViewingReceipt(null)} className="btn btn-secondary" style={{ padding: '12px 18px' }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
