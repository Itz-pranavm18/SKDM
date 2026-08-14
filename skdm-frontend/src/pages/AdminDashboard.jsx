import { useState, useEffect } from 'react';
import { adminApi, getFileUrl } from '../services/api';
import { downloadFeeReceipt } from '../utils/pdfReceiptGenerator';
import Icon from '../components/Icons';
import ImageUploadInput from '../components/ImageUploadInput';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview | users | admissions | feeVerifications | feeCollection | notices | courses | faculty | gallery | messages
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ type: '', text: '' });

  // Data states
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [admissions, setAdmissions] = useState([]);
  const [admissionStatusFilter, setAdmissionStatusFilter] = useState('');
  const [notices, setNotices] = useState([]);
  const [courses, setCourses] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [contactStatusFilter, setContactStatusFilter] = useState('');
  const [contactSearch, setContactSearch] = useState('');
  const [activityLogs, setActivityLogs] = useState([]);

  // Fee & Admission States
  const [feeVerifications, setFeeVerifications] = useState([]);
  const [feeCollectionSummary, setFeeCollectionSummary] = useState(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('BA');
  const [selectedSemesterFilter, setSelectedSemesterFilter] = useState('Semester 1');
  const [feeStructures, setFeeStructures] = useState([]);
  const [editingFeeStructure, setEditingFeeStructure] = useState(null);
  const [newAdmissionForm, setNewAdmissionForm] = useState({
    name: '',
    dob: '',
    address: '',
    mobileNumber: '',
    email: '',
    courseName: 'BA',
    semester: 'Semester 1',
  });
  const [createdCredentials, setCreatedCredentials] = useState(null);

  // Modals & Forms State
  const [modalType, setModalType] = useState(null); // 'newAdmission' | 'credentialsSuccess' | 'editStudent' | 'viewStudent' ...
  const [modalError, setModalError] = useState('');
  const [activeItem, setActiveItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [editStudentForm, setEditStudentForm] = useState({
    name: '',
    dob: '',
    address: '',
    mobileNumber: '',
    email: '',
    courseName: '',
    totalCourseFee: 0,
  });

  // Custom Application Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'primary',
    onConfirm: null,
  });

  const askConfirmation = ({ title, message, confirmText = 'Confirm', variant = 'primary', onConfirm }) => {
    setConfirmModal({
      isOpen: true,
      title: title || 'Confirm Operation',
      message,
      confirmText,
      cancelText: 'Cancel',
      variant,
      onConfirm,
    });
  };

  const closeConfirmModal = () => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  };

  const handleConfirmAction = async () => {
    if (confirmModal.onConfirm) {
      const action = confirmModal.onConfirm;
      closeConfirmModal();
      await action();
    } else {
      closeConfirmModal();
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'admissions') {
      fetchAdmissions();
      fetchFeeCollectionSummary();
      fetchFeeStructures();
    }
    if (activeTab === 'feeStructures') fetchFeeStructures();
    if (activeTab === 'feeVerifications') fetchFeeVerifications();
    if (activeTab === 'feeCollection') fetchFeeCollectionSummary();
    if (activeTab === 'notices') fetchNotices();
    if (activeTab === 'courses') fetchCourses();
    if (activeTab === 'faculty') fetchFaculty();
    if (activeTab === 'gallery') fetchGallery();
    if (activeTab === 'messages') fetchContactMessages();
  }, [activeTab, contactStatusFilter]);

  const showAlert = (type, text) => {
    setAlert({ type, text });
    setTimeout(() => setAlert({ type: '', text: '' }), 4000);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, feeSummaryRes, feeVerificationsRes] = await Promise.allSettled([
        adminApi.getDashboard(),
        adminApi.getFeeCollectionSummary(),
        adminApi.getPendingFeeVerifications(),
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        setStats(dashRes.value.data);
        if (dashRes.value.data.recentActivity) setActivityLogs(dashRes.value.data.recentActivity);
      }
      if (feeSummaryRes.status === 'fulfilled' && feeSummaryRes.value?.data) {
        setFeeCollectionSummary(feeSummaryRes.value.data);
      }
      if (feeVerificationsRes.status === 'fulfilled' && feeVerificationsRes.value?.data) {
        setFeeVerifications(feeVerificationsRes.value.data);
      }
    } catch (err) {
      showAlert('error', err.message || 'Failed to load admin dashboard overview.');
    } finally {
      setLoading(false);
    }
  };

  // ── NEW ADMISSION & FEE HANDLERS ─────────────────────────────────────────────
  const fetchFeeVerifications = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getPendingFeeVerifications();
      if (res?.data) setFeeVerifications(res.data);
    } catch (err) {
      showAlert('error', err.message || 'Failed to fetch pending fee verifications.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeCollectionSummary = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getFeeCollectionSummary();
      if (res?.data) setFeeCollectionSummary(res.data);
    } catch (err) {
      showAlert('error', err.message || 'Failed to fetch fee collection summary.');
    } finally {
      setLoading(false);
    }
  };

  const fetchFeeStructures = async () => {
    try {
      const res = await adminApi.getFeeStructures();
      if (res?.data) setFeeStructures(res.data);
    } catch (err) {
      showAlert('error', err.message || 'Failed to fetch fee structures.');
    }
  };

  const handleCreateNewAdmission = async (e) => {
    e.preventDefault();
    setModalError('');
    if (!newAdmissionForm.name || !newAdmissionForm.dob || !newAdmissionForm.address || !newAdmissionForm.mobileNumber) {
      const msg = 'Please fill all required admission fields (Name, DOB, Mobile, Address).';
      setModalError(msg);
      showAlert('error', msg);
      return;
    }

    if (newAdmissionForm.courseName !== 'BA' && newAdmissionForm.courseName !== 'BSC') {
      const msg = 'Course must be either BA or BSC.';
      setModalError(msg);
      showAlert('error', msg);
      return;
    }

    askConfirmation({
      title: '🎓 Confirm New Admission',
      message: `Are you sure you want to admit ${newAdmissionForm.name} into ${newAdmissionForm.courseName} (${newAdmissionForm.semester || 'Semester 1'})?`,
      confirmText: 'Yes, Admit Student',
      variant: 'success',
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await adminApi.createAdmission({
            name: newAdmissionForm.name,
            dob: newAdmissionForm.dob,
            address: newAdmissionForm.address,
            mobileNumber: newAdmissionForm.mobileNumber,
            email: newAdmissionForm.email || null,
            courseName: newAdmissionForm.courseName,
            courseCode: newAdmissionForm.courseName,
            semester: newAdmissionForm.semester || 'Semester 1',
          });

          if (res?.data) {
            setCreatedCredentials(res.data);
            showAlert('success', `New Student Admitted into ${res.data.courseName} (${res.data.semester})! Student ID: ${res.data.studentId}`);
            setModalType('credentialsSuccess');
            setModalError('');
            setNewAdmissionForm({
              name: '',
              dob: '',
              address: '',
              mobileNumber: '',
              email: '',
              courseName: 'BA',
              semester: 'Semester 1',
            });
            loadDashboardData();
            fetchFeeCollectionSummary();
          }
        } catch (err) {
          const errMsg = err.message || 'Failed to admit new student.';
          setModalError(errMsg);
          showAlert('error', errMsg);
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handlePromoteStudent = async (userId, studentName, currentSem) => {
    askConfirmation({
      title: '⬆️ Confirm Student Promotion',
      message: `Are you sure you want to promote ${studentName} from ${currentSem} to the next semester?`,
      confirmText: 'Yes, Promote Student',
      variant: 'primary',
      onConfirm: async () => {
        setLoading(true);
        try {
          const res = await adminApi.promoteStudent(userId);
          const nextSem = res?.data?.currentSemester || 'next semester';
          showAlert('success', `Student promoted successfully to ${nextSem}!`);
          await fetchFeeCollectionSummary();
          await loadDashboardData();
          if (nextSem && nextSem.startsWith('Semester')) {
            setSelectedSemesterFilter(nextSem);
          }
        } catch (err) {
          showAlert('error', err.message || 'Failed to promote student.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleSaveFeeStructure = async (e) => {
    e.preventDefault();
    if (!editingFeeStructure) return;
    askConfirmation({
      title: '⚙️ Update Fee Structure',
      message: `Are you sure you want to update the fee structure for ${editingFeeStructure.courseCode} (${editingFeeStructure.semester})?`,
      confirmText: 'Yes, Update Structure',
      variant: 'warning',
      onConfirm: async () => {
        setLoading(true);
        try {
          await adminApi.updateFeeStructure(editingFeeStructure.id, editingFeeStructure);
          showAlert('success', `Fee structure updated for ${editingFeeStructure.courseCode} (${editingFeeStructure.semester})`);
          setEditingFeeStructure(null);
          setModalType(null);
          fetchFeeStructures();
        } catch (err) {
          showAlert('error', err.message || 'Failed to update fee structure.');
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleVerifyFeePayment = async (requestId) => {
    askConfirmation({
      title: '💳 Confirm Fee Verification',
      message: 'Are you sure you want to confirm and verify this fee payment request? An official fee receipt will be generated.',
      confirmText: 'Yes, Confirm Verification',
      variant: 'success',
      onConfirm: async () => {
        try {
          const res = await adminApi.verifyFeePayment(requestId);
          showAlert('success', 'Fee payment verified successfully! Receipt generated.');
          fetchFeeVerifications();
          fetchFeeCollectionSummary();
        } catch (err) {
          showAlert('error', err.message || 'Failed to verify fee payment.');
        }
      }
    });
  };

  const handleRejectFeePayment = async (requestId) => {
    const reason = window.prompt('Enter rejection reason (optional):', 'Transaction reference could not be verified');
    if (reason === null) return;
    askConfirmation({
      title: '✖ Reject Fee Payment',
      message: `Are you sure you want to reject this fee payment request? Reason: "${reason}"`,
      confirmText: 'Yes, Reject Payment',
      variant: 'danger',
      onConfirm: async () => {
        try {
          await adminApi.rejectFeePayment(requestId, reason);
          showAlert('success', 'Fee payment request rejected.');
          fetchFeeVerifications();
        } catch (err) {
          showAlert('error', err.message || 'Failed to reject payment.');
        }
      }
    });
  };

  // ── USER MANAGEMENT ──────────────────────────────────────────────────────────
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getUsers(0, userSearch);
      if (res?.data?.content) {
        setUsers(res.data.content);
      } else if (Array.isArray(res?.data)) {
        setUsers(res.data);
      }
    } catch (err) {
      showAlert('error', err.message || 'Failed to fetch users list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (e) => {
    e.preventDefault();
    if (!activeItem) return;
    if (!window.confirm(`Are you sure you want to suspend user @${activeItem.username}?`)) return;
    try {
      await adminApi.suspendUser(activeItem.id, formData.reason || 'Suspended by system administrator');
      showAlert('success', `User @${activeItem.username} suspended successfully.`);
      closeModal();
      fetchUsers();
    } catch (err) {
      showAlert('error', err.message || 'Failed to suspend user.');
    }
  };

  const handleActivateUser = async (user) => {
    if (!window.confirm(`Are you sure you want to activate user @${user.username}?`)) return;
    try {
      await adminApi.activateUser(user.id);
      showAlert('success', `User @${user.username} activated successfully.`);
      fetchUsers();
    } catch (err) {
      showAlert('error', err.message || 'Failed to activate user.');
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Are you sure you want to delete user @${user.username}?`)) return;
    try {
      await adminApi.deleteUser(user.id);
      showAlert('success', `User @${user.username} deleted.`);
      fetchUsers();
      loadDashboardData();
      fetchFeeCollectionSummary();
    } catch (err) {
      showAlert('error', err.message || 'Failed to delete user.');
    }
  };

  const handleAssignRole = async (user, roleName) => {
    if (!window.confirm(`Are you sure you want to assign role ${roleName} to user @${user.username}?`)) return;
    try {
      await adminApi.assignUserRole(user.id, roleName);
      showAlert('success', `Assigned ${roleName} to @${user.username}`);
      fetchUsers();
    } catch (err) {
      showAlert('error', err.message || 'Failed to assign role.');
    }
  };

  // ── ADMISSIONS MANAGEMENT ──────────────────────────────────────────────────
  const fetchAdmissions = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getAdmissions(admissionStatusFilter);
      if (res?.data?.content) {
        setAdmissions(res.data.content);
      } else if (Array.isArray(res?.data)) {
        setAdmissions(res.data);
      }
    } catch (err) {
      showAlert('error', err.message || 'Failed to fetch admissions list.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAdmission = async (e) => {
    e.preventDefault();
    if (!activeItem) return;
    if (!window.confirm(`Are you sure you want to approve admission application #${activeItem.id}?`)) return;
    try {
      await adminApi.approveAdmission(activeItem.id, formData.remarks || 'Application meets eligibility criteria');
      showAlert('success', `Admission application #${activeItem.id} approved!`);
      closeModal();
      fetchAdmissions();
    } catch (err) {
      showAlert('error', err.message || 'Failed to approve application.');
    }
  };

  const handleRejectAdmission = async (e) => {
    e.preventDefault();
    if (!activeItem) return;
    if (!window.confirm(`Are you sure you want to reject admission application #${activeItem.id}?`)) return;
    try {
      await adminApi.rejectAdmission(activeItem.id, formData.reason || 'Does not meet program entry requirements');
      showAlert('success', `Admission application #${activeItem.id} rejected.`);
      closeModal();
      fetchAdmissions();
    } catch (err) {
      showAlert('error', err.message || 'Failed to reject application.');
    }
  };

  // ── NOTICES CRUD ────────────────────────────────────────────────────────────
  const fetchNotices = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getNotices();
      if (res?.data?.content) {
        setNotices(res.data.content);
      } else if (Array.isArray(res?.data)) {
        setNotices(res.data);
      }
    } catch (err) {
      showAlert('error', err.message || 'Failed to fetch notices.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotice = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to ${activeItem?.id ? 'update' : 'publish'} this notice announcement?`)) return;
    const payload = {
      title: formData.title,
      content: formData.content,
      tag: formData.tag || 'General',
      attachmentUrl: formData.attachmentUrl || null,
      pinned: !!formData.pinned,
      active: formData.active !== false,
      noticeDate: formData.noticeDate || new Date().toISOString().split('T')[0],
    };

    try {
      if (activeItem?.id) {
        await adminApi.updateNotice(activeItem.id, payload);
        showAlert('success', 'Notice updated successfully!');
      } else {
        await adminApi.createNotice(payload);
        showAlert('success', 'New notice published successfully!');
      }
      closeModal();
      fetchNotices();
    } catch (err) {
      showAlert('error', err.message || 'Failed to save notice.');
    }
  };

  const handleDeleteNotice = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notice announcement?')) return;
    try {
      await adminApi.deleteNotice(id);
      showAlert('success', 'Notice deleted.');
      fetchNotices();
    } catch (err) {
      showAlert('error', err.message || 'Failed to delete notice.');
    }
  };

  // ── COURSES CRUD ────────────────────────────────────────────────────────────
  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getCourses();
      if (res?.data?.content) {
        setCourses(res.data.content);
      } else if (Array.isArray(res?.data)) {
        setCourses(res.data);
      }
    } catch (err) {
      showAlert('error', err.message || 'Failed to fetch courses.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to ${activeItem?.id ? 'update' : 'create'} course program ${formData.name || ''}?`)) return;
    const payload = {
      code: formData.code,
      name: formData.name,
      shortName: formData.shortName || formData.code,
      durationYears: parseInt(formData.durationYears || 3),
      totalSeats: parseInt(formData.totalSeats || 60),
      eligibility: formData.eligibility || '10+2',
      tuitionFee: parseFloat(formData.tuitionFee || 0),
      otherFee: parseFloat(formData.otherFee || 0),
      active: formData.active !== false,
    };

    try {
      if (activeItem?.id) {
        await adminApi.updateCourse(activeItem.id, payload);
        showAlert('success', 'Course updated successfully!');
      } else {
        await adminApi.createCourse(payload);
        showAlert('success', 'New course created successfully!');
      }
      closeModal();
      fetchCourses();
    } catch (err) {
      showAlert('error', err.message || 'Failed to save course.');
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Delete this course program?')) return;
    try {
      await adminApi.deleteCourse(id);
      showAlert('success', 'Course deleted.');
      fetchCourses();
    } catch (err) {
      showAlert('error', err.message || 'Failed to delete course.');
    }
  };

  // ── FACULTY CRUD ────────────────────────────────────────────────────────────
  const fetchFaculty = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getFaculty();
      if (res?.data?.content) {
        setFaculty(res.data.content);
      } else if (Array.isArray(res?.data)) {
        setFaculty(res.data);
      }
    } catch (err) {
      showAlert('error', err.message || 'Failed to fetch faculty list.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFaculty = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Are you sure you want to ${activeItem?.id ? 'update' : 'add'} faculty member ${formData.name || ''}?`)) return;
    const payload = {
      name: formData.name,
      designation: formData.designation,
      qualification: formData.qualification,
      photoUrl: formData.photoUrl || null,
      initials: formData.initials || (formData.name ? formData.name.substring(0, 2).toUpperCase() : 'FC'),
      experienceYears: parseInt(formData.experienceYears || 0),
      active: formData.active !== false,
    };

    try {
      if (activeItem?.id) {
        await adminApi.updateFaculty(activeItem.id, payload);
        showAlert('success', 'Faculty member updated!');
      } else {
        await adminApi.createFaculty(payload);
        showAlert('success', 'Faculty member added successfully!');
      }
      closeModal();
      fetchFaculty();
    } catch (err) {
      showAlert('error', err.message || 'Failed to save faculty record.');
    }
  };

  const handleDeleteFaculty = async (id) => {
    if (!window.confirm('Are you sure you want to remove this faculty member record?')) return;
    try {
      await adminApi.deleteFaculty(id);
      showAlert('success', 'Faculty record removed.');
      fetchFaculty();
    } catch (err) {
      showAlert('error', err.message || 'Failed to remove faculty member.');
    }
  };

  // ── GALLERY CRUD ────────────────────────────────────────────────────────────
  const fetchGallery = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getGallery();
      if (res?.data) {
        setGallery(Array.isArray(res.data) ? res.data : []);
      }
    } catch (err) {
      showAlert('error', err.message || 'Failed to fetch gallery items.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGalleryItem = async (e) => {
    e.preventDefault();
    if (!window.confirm('Are you sure you want to upload this photo item to the gallery?')) return;
    const payload = {
      caption: formData.caption,
      tag: formData.tag || 'Campus',
      imageUrl: formData.imageUrl || '/uploads/campus.jpg',
      active: true,
    };

    try {
      await adminApi.createGalleryItem(payload);
      showAlert('success', 'Gallery item added successfully!');
      closeModal();
      fetchGallery();
    } catch (err) {
      showAlert('error', err.message || 'Failed to add gallery item.');
    }
  };

  const handleDeleteGalleryItem = async (id) => {
    if (!window.confirm('Delete photo from gallery?')) return;
    try {
      await adminApi.deleteGalleryItem(id);
      showAlert('success', 'Gallery photo deleted.');
      fetchGallery();
    } catch (err) {
      showAlert('error', err.message || 'Failed to delete gallery item.');
    }
  };

  // ── CONTACT MESSAGES MANAGEMENT ─────────────────────────────────────────────
  const fetchContactMessages = async () => {
    setLoading(true);
    try {
      const res = await adminApi.getContactMessages(contactStatusFilter);
      if (res?.data?.content) {
        setContactMessages(res.data.content);
      } else if (Array.isArray(res?.data)) {
        setContactMessages(res.data);
      }
    } catch (err) {
      showAlert('error', err.message || 'Failed to fetch contact messages.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkMessageRead = async (id) => {
    try {
      await adminApi.markContactMessageRead(id);
      showAlert('success', 'Message marked as read.');
      fetchContactMessages();
      loadDashboardData();
    } catch (err) {
      showAlert('error', err.message || 'Failed to mark message as read.');
    }
  };

  const handleDeleteContactMessage = async (id) => {
    if (!window.confirm('Are you sure you want to delete this contact message?')) return;
    try {
      await adminApi.deleteContactMessage(id);
      showAlert('success', 'Message deleted successfully.');
      fetchContactMessages();
      loadDashboardData();
    } catch (err) {
      showAlert('error', err.message || 'Failed to delete contact message.');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!activeItem?.id || !formData.replyText?.trim()) {
      showAlert('error', 'Please enter a response message.');
      return;
    }
    setLoading(true);
    try {
      await adminApi.replyContactMessage(activeItem.id, formData.replyText.trim());
      showAlert('success', `Reply sent successfully to ${activeItem.email}!`);
      closeModal();
      fetchContactMessages();
      loadDashboardData();
    } catch (err) {
      showAlert('error', err.message || 'Failed to send reply email.');
    } finally {
      setLoading(false);
    }
  };

  // Modal helpers
  const openModal = (type, item = null) => {
    setModalType(type);
    setActiveItem(item);
    setFormData(item ? { ...item } : {});
    setModalError('');
    if (type === 'editStudent' && item) {
      setEditStudentForm({
        name: item.name || '',
        dob: item.dob || '',
        address: item.address || '',
        mobileNumber: item.mobileNumber || '',
        email: item.email || '',
        courseName: item.courseName || 'Bachelor of Arts (B.A.)',
        totalCourseFee: item.totalFee || 0,
      });
    }
  };

  const closeModal = () => {
    setModalType(null);
    setActiveItem(null);
    setFormData({});
    setModalError('');
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    if (!activeItem?.userId) return;
    setModalError('');
    if (!editStudentForm.name || !editStudentForm.dob || !editStudentForm.address || !editStudentForm.mobileNumber || !editStudentForm.totalCourseFee) {
      const msg = 'Please fill all required student fields.';
      setModalError(msg);
      showAlert('error', msg);
      return;
    }

    if (!window.confirm(`Are you sure you want to update details for student ${editStudentForm.name}?`)) {
      return;
    }

    setLoading(true);
    try {
      await adminApi.updateStudent(activeItem.userId, {
        name: editStudentForm.name,
        dob: editStudentForm.dob,
        address: editStudentForm.address,
        mobileNumber: editStudentForm.mobileNumber,
        email: editStudentForm.email || null,
        courseName: editStudentForm.courseName,
        totalCourseFee: parseFloat(editStudentForm.totalCourseFee),
      });

      showAlert('success', `Student ${editStudentForm.name} details updated successfully!`);
      closeModal();
      loadDashboardData();
      fetchFeeCollectionSummary();
    } catch (err) {
      const errMsg = err.message || 'Failed to update student details.';
      setModalError(errMsg);
      showAlert('error', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudentPermanently = async (stu) => {
    if (!stu?.userId) return;
    if (!window.confirm(`Are you sure you want to permanently delete student ${stu.name} (${stu.studentId})? All associated fee payment records and application data will be permanently purged.`)) {
      return;
    }

    setLoading(true);
    try {
      await adminApi.deleteStudent(stu.userId);
      showAlert('success', `Student ${stu.name} (${stu.studentId}) and all associated records deleted permanently.`);
      loadDashboardData();
      fetchFeeCollectionSummary();
      fetchUsers();
    } catch (err) {
      showAlert('error', err.message || 'Failed to delete student record.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="admin-dashboard-page">
      <div className="container">
        {/* Header Title */}
        <div className="admin-header-card">
          <div className="admin-header-title">
            <span className="eyebrow-badge">SKM System Administration</span>
            <h2>Administrator Control Portal</h2>
            <p>Manage student admissions, fee verification, fee collection analytics, notice board, and courses.</p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => setModalType('newAdmission')} style={{ background: '#16a34a', borderColor: '#16a34a', fontWeight: 700 }}>
              🎓 New Admission
            </button>
            <button className="btn btn-secondary" onClick={loadDashboardData} disabled={loading}>
              <Icon name="refresh" /> Refresh Portal Data
            </button>
          </div>
        </div>

        {/* Global Alert Notification */}
        {alert.text && (
          <div className={`auth-alert ${alert.type} mb-4`}>
            <Icon name={alert.type === 'success' ? 'check' : 'alert-circle'} />
            <span>{alert.text}</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="admin-tabs">
          <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
            <Icon name="dashboard" /> Overview
          </button>
          <button className={`tab-btn ${activeTab === 'feeStructures' ? 'active' : ''}`} onClick={() => setActiveTab('feeStructures')}>
            ⚙️ Fee Structure
          </button>
          <button className={`tab-btn ${activeTab === 'feeVerifications' ? 'active' : ''}`} onClick={() => setActiveTab('feeVerifications')}>
            💳 Fee Verification {feeVerifications.length > 0 && <span className="badge badge-warning ml-1" style={{ fontSize: 11, padding: "2px 6px", borderRadius: 10, background: "#f59e0b", color: "#fff" }}>{feeVerifications.length}</span>}
          </button>
          <button className={`tab-btn ${activeTab === 'feeCollection' ? 'active' : ''}`} onClick={() => setActiveTab('feeCollection')}>
            📊 Fee Collection
          </button>
          <button className={`tab-btn ${activeTab === 'admissions' ? 'active' : ''}`} onClick={() => setActiveTab('admissions')}>
            <Icon name="file" /> Admissions & Students
          </button>
          <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <Icon name="user" /> Users Management
          </button>
          <button className={`tab-btn ${activeTab === 'notices' ? 'active' : ''}`} onClick={() => setActiveTab('notices')}>
            <Icon name="bell" /> Notice Board
          </button>
          <button className={`tab-btn ${activeTab === 'courses' ? 'active' : ''}`} onClick={() => setActiveTab('courses')}>
            <Icon name="book" /> Courses
          </button>
          <button className={`tab-btn ${activeTab === 'faculty' ? 'active' : ''}`} onClick={() => setActiveTab('faculty')}>
            <Icon name="users" /> Faculty
          </button>
          <button className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveTab('gallery')}>
            <Icon name="image" /> Gallery
          </button>
          <button className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`} onClick={() => setActiveTab('messages')}>
            <Icon name="mail" /> Messages {stats?.unreadMessages > 0 && <span className="badge badge-warning ml-1" style={{ fontSize: 11, padding: "2px 6px", borderRadius: 10, background: "var(--gold-soft)", color: "var(--navy-deep)" }}>{stats.unreadMessages}</span>}
          </button>
        </div>

        {/* TAB: FEE VERIFICATION REQUESTS */}
        {activeTab === 'feeVerifications' && (
          <div className="admin-tab-section">
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    💳 Fee Verification Requests
                  </h3>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                    Review pending payment receipt requests submitted by students. Confirm verification to update fee balances and generate official PDF receipts.
                  </p>
                </div>
                <button onClick={fetchFeeVerifications} className="btn btn-outline-sm">
                  <Icon name="refresh" /> Refresh List
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading pending payment requests...</div>
              ) : feeVerifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 50, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                  <span style={{ fontSize: 32, display: 'block', marginBottom: 10 }}>🎉</span>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>No Pending Verification Requests</h4>
                  <p style={{ color: '#64748b', fontSize: 14, margin: '6px 0 0 0' }}>All student fee payment requests have been processed.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: 12, textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 14px' }}>Req ID</th>
                        <th style={{ padding: '12px 14px' }}>Student Details</th>
                        <th style={{ padding: '12px 14px' }}>Course & Semester</th>
                        <th style={{ padding: '12px 14px' }}>Requested Fee Types</th>
                        <th style={{ padding: '12px 14px' }}>Total Amount (₹)</th>
                        <th style={{ padding: '12px 14px' }}>Transaction Ref / UTR</th>
                        <th style={{ padding: '12px 14px' }}>Remarks</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeVerifications.map((req) => (
                        <tr key={req.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                          <td style={{ padding: '14px', fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>
                            #{req.id}
                          </td>
                          <td style={{ padding: '14px' }}>
                            <strong style={{ color: '#0f172a' }}>{req.studentName}</strong>
                            <div style={{ fontSize: 12, color: '#2563eb', fontWeight: 700 }}>ID: {req.studentId}</div>
                          </td>
                          <td style={{ padding: '14px' }}>
                            <strong style={{ color: '#0f172a' }}>{req.courseName}</strong>
                            <div style={{ fontSize: 12, color: '#64748b', fontWeight: 600 }}>{req.semester || 'Semester 1'}</div>
                          </td>
                          <td style={{ padding: '14px', fontWeight: 600, color: '#334155' }}>
                            {req.feeTypesPaid || 'Course Fee'}
                          </td>
                          <td style={{ padding: '14px', fontWeight: 900, color: '#16a34a', fontSize: 16 }}>
                            ₹{Number(req.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '14px', color: '#475569' }}>
                            <div>UTR: <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{req.utrNumber}</strong></div>
                            <small style={{ color: '#94a3b8' }}>Txn: {req.transactionNumber}</small>
                            <div style={{ fontSize: 11, color: '#64748b' }}>Date: {req.paymentDate}</div>
                          </td>
                          <td style={{ padding: '14px', fontSize: 13 }}>
                            {req.screenshotUrl ? (
                              <a href={getFileUrl(req.screenshotUrl)} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 700, display: 'block', marginBottom: 4 }}>
                                🖼 View Proof Screenshot
                              </a>
                            ) : null}
                            {req.remarks ? <span style={{ color: '#475569', fontStyle: 'italic' }}>"{req.remarks}"</span> : <span style={{ color: '#94a3b8' }}>None</span>}
                          </td>
                          <td style={{ padding: '14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button
                                type="button"
                                onClick={() => handleVerifyFeePayment(req.id)}
                                className="btn-sm"
                                style={{ background: '#16a34a', color: '#fff', border: 'none', padding: '6px 12px', fontSize: 13, fontWeight: 700, borderRadius: 6, cursor: 'pointer' }}
                              >
                                ✔ Confirm Verification
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRejectFeePayment(req.id)}
                                className="btn-sm btn-danger"
                                style={{ padding: '6px 12px', fontSize: 13, fontWeight: 700, borderRadius: 6, cursor: 'pointer' }}
                              >
                                ✖ Reject
                              </button>
                            </div>
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

        {/* TAB: SEMESTER FEE STRUCTURE MANAGEMENT */}
        {activeTab === 'feeStructures' && (
          <div className="admin-tab-section">
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    ⚙️ Semester Fee Structure Management
                  </h3>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                    Manage fee breakdowns (Academic Fee, Sports Fee, Examination Fee, Other Fee) per semester for B.A. and B.Sc. programs.
                  </p>
                </div>
                <button onClick={fetchFeeStructures} className="btn btn-outline-sm">
                  <Icon name="refresh" /> Refresh Fee Structures
                </button>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading fee structures...</div>
              ) : feeStructures.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, background: '#f8fafc', borderRadius: 8 }}>
                  <p style={{ color: '#64748b', margin: 0 }}>No fee structures configured.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: 12, textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 14px' }}>Course</th>
                        <th style={{ padding: '12px 14px' }}>Semester</th>
                        <th style={{ padding: '12px 14px' }}>Academic Fee (₹)</th>
                        <th style={{ padding: '12px 14px' }}>Sports Fee (₹)</th>
                        <th style={{ padding: '12px 14px' }}>Exam Fee (₹)</th>
                        <th style={{ padding: '12px 14px' }}>Other Fee (₹)</th>
                        <th style={{ padding: '12px 14px' }}>Total Fee (₹)</th>
                        <th style={{ padding: '12px 14px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeStructures.map((fs) => (
                        <tr key={fs.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a' }}>
                            {fs.courseCode}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2563eb' }}>
                            {fs.semester}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#334155' }}>
                            ₹{Number(fs.academicFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#334155' }}>
                            ₹{Number(fs.sportsFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#334155' }}>
                            ₹{Number(fs.examFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '12px 14px', color: '#334155' }}>
                            ₹{Number(fs.otherFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '12px 14px', fontWeight: 800, color: '#16a34a' }}>
                            ₹{Number(fs.totalFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </td>
                          <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingFeeStructure({ ...fs });
                                setModalType('editFeeStructure');
                              }}
                              className="btn-sm btn-warning"
                              style={{ padding: '6px 12px', fontSize: 13, fontWeight: 700, borderRadius: 6, cursor: 'pointer' }}
                            >
                              ✏️ Edit Structure
                            </button>
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

        {/* TAB: FEE COLLECTION ANALYTICS & STUDENT LIST */}
        {activeTab === 'feeCollection' && (
          <div className="admin-tab-section">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, marginBottom: 28 }}>
              <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: 8 }}>Total Course Fees</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#0f172a' }}>
                  ₹{Number(feeCollectionSummary?.totalFees || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <span style={{ fontSize: 12, color: '#64748b' }}>Assigned for all admitted students</span>
              </div>

              <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', marginBottom: 8 }}>Total Collected Fees</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#16a34a' }}>
                  ₹{Number(feeCollectionSummary?.totalCollectedFees || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <span style={{ fontSize: 12, color: '#16a34a' }}>✔ Verified fee collections</span>
              </div>

              <div style={{ background: '#fff', borderRadius: 12, padding: 24, border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', marginBottom: 8 }}>Remaining Pending Fees</div>
                <div style={{ fontSize: 30, fontWeight: 800, color: '#dc2626' }}>
                  ₹{Number(feeCollectionSummary?.remainingFees || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </div>
                <span style={{ fontSize: 12, color: '#dc2626' }}>Outstanding student fee balance</span>
              </div>
            </div>

            {/* Student-wise fee status table */}
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 16 }}>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  👨‍🎓 Student Fee Status Directory
                </h3>

                <input
                  type="text"
                  placeholder="Search student by Name, ID, or Course..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                  style={{ maxWidth: 320, width: '100%', padding: '8px 14px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 14 }}
                />
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading student fee directory...</div>
              ) : !feeCollectionSummary?.students || feeCollectionSummary.students.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, background: '#f8fafc', borderRadius: 8 }}>
                  <p style={{ color: '#64748b', margin: 0 }}>No admitted students found.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: 12, textTransform: 'uppercase' }}>
                        <th style={{ padding: '12px 16px' }}>Student ID</th>
                        <th style={{ padding: '12px 16px' }}>Name & Contact</th>
                        <th style={{ padding: '12px 16px' }}>Course</th>
                        <th style={{ padding: '12px 16px' }}>Total Fee (₹)</th>
                        <th style={{ padding: '12px 16px' }}>Paid Fee (₹)</th>
                        <th style={{ padding: '12px 16px' }}>Remaining Fee (₹)</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {feeCollectionSummary.students
                        .filter(s => {
                          if (!studentSearchTerm) return true;
                          const term = studentSearchTerm.toLowerCase();
                          return (
                            (s.name && s.name.toLowerCase().includes(term)) ||
                            (s.studentId && s.studentId.toLowerCase().includes(term)) ||
                            (s.courseName && s.courseName.toLowerCase().includes(term))
                          );
                        })
                        .map((s) => {
                          const isFullyPaid = s.remainingFee <= 0;
                          return (
                            <tr key={s.userId} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                              <td style={{ padding: '14px 16px', fontWeight: 700, color: '#2563eb' }}>{s.studentId}</td>
                              <td style={{ padding: '14px 16px' }}>
                                <div style={{ fontWeight: 700, color: '#0f172a' }}>{s.name}</div>
                                <small style={{ color: '#64748b' }}>{s.mobileNumber} | {s.email}</small>
                              </td>
                              <td style={{ padding: '14px 16px', color: '#334155' }}>{s.courseName || 'N/A'}</td>
                              <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>
                                ₹{Number(s.totalFee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ padding: '14px 16px', fontWeight: 700, color: '#16a34a' }}>
                                ₹{Number(s.paidFee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ padding: '14px 16px', fontWeight: 700, color: isFullyPaid ? '#16a34a' : '#dc2626' }}>
                                ₹{Number(s.remainingFee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ padding: '14px 16px' }}>
                                {isFullyPaid ? (
                                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                                    FULL PAID
                                  </span>
                                ) : s.paidFee > 0 ? (
                                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                                    PARTIAL
                                  </span>
                                ) : (
                                  <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '4px 10px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                                    PENDING
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="admin-tab-section">
            <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18 }}>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', border: '1px solid #334155', borderRadius: 14, padding: 22, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                <div className="stat-icon users" style={{ background: 'rgba(37, 99, 235, 0.25)', color: '#60a5fa', borderRadius: 12, padding: 12 }}><Icon name="user" /></div>
                <div className="stat-info">
                  <span className="stat-num" style={{ color: '#ffffff', fontSize: 32, fontWeight: 900 }}>{stats?.totalUsers ?? '—'}</span>
                  <span className="stat-label" style={{ color: '#94a3b8', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Users</span>
                </div>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', border: '1px solid #059669', borderRadius: 14, padding: 22, boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.2)' }}>
                <div className="stat-icon admissions" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', borderRadius: 12, padding: 12 }}><Icon name="file" /></div>
                <div className="stat-info">
                  <span className="stat-num" style={{ color: '#ffffff', fontSize: 32, fontWeight: 900 }}>
                    {feeCollectionSummary?.totalStudents !== undefined && feeCollectionSummary?.totalStudents !== null
                      ? feeCollectionSummary.totalStudents
                      : (stats?.totalAdmissions ?? '—')}
                  </span>
                  <span className="stat-label" style={{ color: '#a7f3d0', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Total Admissions</span>
                </div>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #9a3412 0%, #c2410c 100%)', border: '1px solid #ea580c', borderRadius: 14, padding: 22, boxShadow: '0 10px 15px -3px rgba(249, 115, 22, 0.2)' }}>
                <div className="stat-icon pending" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', borderRadius: 12, padding: 12 }}><Icon name="clock" /></div>
                <div className="stat-info">
                  <span className="stat-num" style={{ color: '#ffffff', fontSize: 32, fontWeight: 900 }}>
                    {loading && feeVerifications.length === 0 && stats?.pendingFeeVerifications === undefined
                      ? '...'
                      : (feeVerifications.length > 0 ? feeVerifications.length : (stats?.pendingFeeVerifications ?? 0))}
                  </span>
                  <span className="stat-label" style={{ color: '#ffedd5', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Pending Fee Verifications</span>
                </div>
              </div>
              <div className="stat-card" style={{ background: 'linear-gradient(135deg, #581c87 0%, #7e22ce 100%)', border: '1px solid #9333ea', borderRadius: 14, padding: 22, boxShadow: '0 10px 15px -3px rgba(168, 85, 247, 0.2)' }}>
                <div className="stat-icon messages" style={{ background: 'rgba(255, 255, 255, 0.2)', color: '#ffffff', borderRadius: 12, padding: 12 }}><Icon name="mail" /></div>
                <div className="stat-info">
                  <span className="stat-num" style={{ color: '#ffffff', fontSize: 32, fontWeight: 900 }}>{stats?.unreadMessages ?? '0'}</span>
                  <span className="stat-label" style={{ color: '#f3e8ff', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>Unread Messages</span>
                </div>
              </div>
            </div>

            <div className="overview-split-grid mt-6">
              {/* Latest Registrations */}
              <div className="details-card">
                <h3>Recent User Registrations</h3>
                {stats?.latestRegistrations && stats.latestRegistrations.length > 0 ? (
                  <div className="admin-list">
                    {stats.latestRegistrations.map((u) => (
                      <div key={u.id} className="admin-list-item">
                        <div>
                          <strong>{u.name}</strong>
                          <span className="text-sub">{u.email}</span>
                        </div>
                        <span className="badge role-badge">ID #{u.id}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sub">No recent registrations logged.</p>
                )}
              </div>

              {/* Recent Activity Log */}
              <div className="details-card">
                <h3>System Audit & Activity Logs</h3>
                {activityLogs.length > 0 ? (
                  <div className="admin-list">
                    {activityLogs.slice(0, 6).map((log) => (
                      <div key={log.id} className="admin-list-item">
                        <div>
                          <strong>{log.action}</strong>
                          <span className="text-sub">{log.description} ({log.username || 'System'})</span>
                        </div>
                        <span className="badge font-mono">{new Date(log.performedAt).toLocaleTimeString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sub">No recent activity logs available.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: USERS MANAGEMENT */}
        {activeTab === 'users' && (
          <div className="admin-tab-section">
            <div className="table-controls-bar">
              <div className="search-input-wrapper">
                <Icon name="search" />
                <input
                  type="text"
                  placeholder="Search by name, email, or username..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                />
              </div>
              <button className="btn btn-primary" onClick={fetchUsers}>
                Search
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User ID</th>
                    <th>Name</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Roles</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td><strong>{u.fullName || `${u.firstName} ${u.lastName}`}</strong></td>
                      <td>@{u.username}</td>
                      <td>{u.email}</td>
                      <td>{u.phone || '—'}</td>
                      <td>
                        <span className="badge role-badge">
                          {u.roles ? u.roles.join(', ') : 'ROLE_USER'}
                        </span>
                      </td>
                      <td>
                        {u.suspended ? (
                          <span className="status-pill rejected">SUSPENDED</span>
                        ) : u.active ? (
                          <span className="status-pill approved">ACTIVE</span>
                        ) : (
                          <span className="status-pill">INACTIVE</span>
                        )}
                      </td>
                      <td className="action-buttons">
                        {u.suspended ? (
                          <button className="btn-sm btn-success" onClick={() => handleActivateUser(u)}>
                            Activate
                          </button>
                        ) : (
                          <button className="btn-sm btn-warning" onClick={() => openModal('suspendUser', u)}>
                            Suspend
                          </button>
                        )}
                        <button className="btn-sm btn-danger" onClick={() => handleDeleteUser(u)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center p-4">No users found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: FEE STRUCTURE MANAGEMENT */}
        {activeTab === 'feeStructures' && (
          <div className="admin-tab-section">
            <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    ⚙️ Semester Fee Structure Management
                  </h3>
                  <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                    Configure standard fee components (Academic Fee, Sports Fee, Exam Fee, Other Fee) for BA and BSC across all 6 semesters.
                  </p>
                </div>
                <button onClick={fetchFeeStructures} className="btn btn-outline-sm">
                  <Icon name="refresh" /> Refresh Fee Templates
                </button>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: 12, textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px' }}>Course</th>
                      <th style={{ padding: '12px 16px' }}>Semester</th>
                      <th style={{ padding: '12px 16px' }}>Academic Fee (₹)</th>
                      <th style={{ padding: '12px 16px' }}>Sports Fee (₹)</th>
                      <th style={{ padding: '12px 16px' }}>Exam Fee (₹)</th>
                      <th style={{ padding: '12px 16px' }}>Other Fee (₹)</th>
                      <th style={{ padding: '12px 16px' }}>Total Fee (₹)</th>
                      <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feeStructures.map((fs) => (
                      <tr key={fs.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                        <td style={{ padding: '14px 16px', fontWeight: 800, color: '#2563eb' }}>{fs.courseCode}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a' }}>{fs.semester}</td>
                        <td style={{ padding: '14px 16px', color: '#334155' }}>₹{Number(fs.academicFee || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '14px 16px', color: '#334155' }}>₹{Number(fs.sportsFee || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '14px 16px', color: '#334155' }}>₹{Number(fs.examFee || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '14px 16px', color: '#334155' }}>₹{Number(fs.otherFee || 0).toLocaleString('en-IN')}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 800, color: '#16a34a' }}>
                          ₹{Number(fs.totalFee || 0).toLocaleString('en-IN')}
                        </td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <button
                            onClick={() => {
                              setEditingFeeStructure(fs);
                              setModalType('editFeeStructure');
                            }}
                            className="btn-sm btn-warning"
                            style={{ padding: '6px 12px', fontSize: 12, fontWeight: 700 }}
                          >
                            ✏️ Edit Structure
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: COURSE & SEMESTER FILTERED ADMISSIONS & STUDENTS MODULE */}
        {activeTab === 'admissions' && (() => {
          const allAdmittedStudents = feeCollectionSummary?.students || [];

          const getCourseCode = (s) => {
            if (s.courseName && s.courseName.toUpperCase().includes('BSC')) return 'BSC';
            if (s.course && s.course.toUpperCase().includes('BSC')) return 'BSC';
            return 'BA';
          };

          const getSemesterName = (s) => {
            if (s.currentSemester) return s.currentSemester;
            if (s.semester) return s.semester;
            return 'Semester 1';
          };

          const courseOptions = [
            { code: 'BA', label: 'B.A. (Bachelor of Arts)' },
            { code: 'BSC', label: 'B.Sc. (Bachelor of Science)' },
          ];

          const semesterOptions = [
            'Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6'
          ];

          const filteredStudents = allAdmittedStudents.filter(s => {
            const courseMatch = getCourseCode(s) === selectedCourseFilter;
            const semesterMatch = getSemesterName(s) === selectedSemesterFilter;
            return courseMatch && semesterMatch;
          });

          return (
            <div className="admin-tab-section">
              <div style={{ background: '#fff', borderRadius: 12, padding: 28, border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                  <div>
                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0 }}>
                      🎓 Student Directory & Promotion Management
                    </h3>
                    <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: 14 }}>
                      Browse students by Course and Semester, view individual fee balances, and promote students to higher semesters.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button
                      onClick={() => setModalType('newAdmission')}
                      className="btn btn-primary"
                      style={{ background: '#16a34a', borderColor: '#16a34a', fontWeight: 700 }}
                    >
                      + New Admission
                    </button>
                    <button onClick={() => { fetchAdmissions(); fetchFeeCollectionSummary(); }} className="btn btn-outline-sm">
                      <Icon name="refresh" /> Refresh Directory
                    </button>
                  </div>
                </div>

                {/* Course Navigation (BA / BSC) */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  {courseOptions.map((c) => {
                    const isActive = selectedCourseFilter === c.code;
                    const count = allAdmittedStudents.filter(s => getCourseCode(s) === c.code).length;
                    return (
                      <button
                        key={c.code}
                        onClick={() => setSelectedCourseFilter(c.code)}
                        style={{
                          flex: 1,
                          padding: '12px 18px',
                          borderRadius: 10,
                          border: isActive ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: isActive ? '#f0f6ff' : '#f8fafc',
                          color: isActive ? '#1e40af' : '#475569',
                          fontWeight: 800,
                          fontSize: 15,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s'
                        }}
                      >
                        <span>🏛️ {c.label}</span>
                        <span style={{
                          background: isActive ? '#2563eb' : '#e2e8f0',
                          color: isActive ? '#ffffff' : '#475569',
                          padding: '2px 10px',
                          borderRadius: 12,
                          fontSize: 12
                        }}>
                          {count} Total
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Semester Navigation Pills (Semester 1 to Semester 6) */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #f1f5f9' }}>
                  {semesterOptions.map((sem) => {
                    const isActive = selectedSemesterFilter === sem;
                    const semCount = allAdmittedStudents.filter(s => getCourseCode(s) === selectedCourseFilter && getSemesterName(s) === sem).length;
                    return (
                      <button
                        key={sem}
                        onClick={() => setSelectedSemesterFilter(sem)}
                        style={{
                          background: isActive ? '#0f172a' : '#ffffff',
                          color: isActive ? '#ffffff' : '#334155',
                          border: isActive ? '1px solid #0f172a' : '1px solid #cbd5e1',
                          borderRadius: 20,
                          padding: '7px 16px',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6
                        }}
                      >
                        <span>{sem}</span>
                        <span style={{
                          background: isActive ? '#3b82f6' : '#f1f5f9',
                          color: isActive ? '#ffffff' : '#64748b',
                          padding: '1px 7px',
                          borderRadius: 10,
                          fontSize: 11
                        }}>
                          {semCount}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {loading ? (
                  <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>Loading student directory...</div>
                ) : filteredStudents.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 50, background: '#f8fafc', borderRadius: 8, border: '1px dashed #cbd5e1' }}>
                    <span style={{ fontSize: 32, display: 'block', marginBottom: 10 }}>📚</span>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>No Students in {selectedCourseFilter} ({selectedSemesterFilter})</h4>
                    <p style={{ color: '#64748b', fontSize: 14, margin: '6px 0 0 0' }}>
                      There are currently no admitted students registered in <strong>{selectedCourseFilter} - {selectedSemesterFilter}</strong>.
                    </p>
                    <button
                      onClick={() => {
                        setNewAdmissionForm({
                          ...newAdmissionForm,
                          courseName: selectedCourseFilter,
                          semester: selectedSemesterFilter
                        });
                        setModalType('newAdmission');
                      }}
                      className="btn btn-primary"
                      style={{ marginTop: 16, background: '#16a34a', borderColor: '#16a34a' }}
                    >
                      + Admit Student to {selectedCourseFilter} ({selectedSemesterFilter})
                    </button>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ background: '#f1f5f9', color: '#475569', fontSize: 12, textTransform: 'uppercase' }}>
                          <th style={{ padding: '12px 14px' }}>Student ID</th>
                          <th style={{ padding: '12px 14px' }}>Student Name</th>
                          <th style={{ padding: '12px 14px' }}>Mobile Number</th>
                          <th style={{ padding: '12px 14px' }}>DOB</th>
                          <th style={{ padding: '12px 14px' }}>Course</th>
                          <th style={{ padding: '12px 14px' }}>Semester</th>
                          <th style={{ padding: '12px 14px' }}>Total Fee (₹)</th>
                          <th style={{ padding: '12px 14px' }}>Paid Fee (₹)</th>
                          <th style={{ padding: '12px 14px' }}>Remaining Fee (₹)</th>
                          <th style={{ padding: '12px 14px' }}>Status</th>
                          <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((stu) => {
                          const isFullyPaid = (stu.remainingFee || 0) <= 0;
                          return (
                            <tr key={stu.userId || stu.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: 14 }}>
                              <td style={{ padding: '12px 14px', fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}>
                                {stu.studentId}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                <strong style={{ color: '#0f172a' }}>{stu.name || stu.studentName}</strong>
                                {stu.email && <div style={{ fontSize: 12, color: '#64748b' }}>{stu.email}</div>}
                              </td>
                              <td style={{ padding: '12px 14px', color: '#334155' }}>{stu.mobileNumber || stu.phone || 'N/A'}</td>
                              <td style={{ padding: '12px 14px', color: '#334155' }}>{stu.dob || 'N/A'}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>{getCourseCode(stu)}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#2563eb' }}>{getSemesterName(stu)}</td>
                              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a' }}>
                                ₹{Number(stu.totalFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ padding: '12px 14px', fontWeight: 700, color: '#16a34a' }}>
                                ₹{Number(stu.paidFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ padding: '12px 14px', fontWeight: 700, color: isFullyPaid ? '#16a34a' : '#dc2626' }}>
                                ₹{Number(stu.remainingFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td style={{ padding: '12px 14px' }}>
                                {isFullyPaid ? (
                                  <span style={{ background: '#dcfce7', color: '#15803d', padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                                    FULL PAID
                                  </span>
                                ) : (stu.paidFee || 0) > 0 ? (
                                  <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                                    PARTIAL
                                  </span>
                                ) : (
                                  <span style={{ background: '#fee2e2', color: '#b91c1c', padding: '3px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 }}>
                                    PENDING
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '12px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                                  <button
                                    type="button"
                                    onClick={() => handlePromoteStudent(stu.userId || stu.id, stu.name || stu.studentName, getSemesterName(stu))}
                                    className="btn-sm"
                                    style={{ background: '#7c3aed', color: '#ffffff', padding: '4px 10px', fontSize: 12, fontWeight: 700, borderRadius: 6 }}
                                    title="Promote to Next Semester"
                                  >
                                    ⬆️ Promote
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openModal('viewStudent', stu)}
                                    className="btn-sm btn-outline"
                                    style={{ padding: '4px 8px', fontSize: 12 }}
                                    title="View Details"
                                  >
                                    👁️ View
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => openModal('editStudent', stu)}
                                    className="btn-sm btn-warning"
                                    style={{ padding: '4px 8px', fontSize: 12 }}
                                    title="Edit Details"
                                  >
                                    ✏️ Edit
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteStudentPermanently(stu)}
                                    className="btn-sm btn-danger"
                                    style={{ padding: '4px 8px', fontSize: 12 }}
                                    title="Delete Record"
                                  >
                                    🗑️ Delete
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* TAB 4: NOTICES CRUD */}
        {activeTab === 'notices' && (
          <div className="admin-tab-section">
            <div className="table-controls-bar justify-between">
              <h3>Notice Board Announcements</h3>
              <button className="btn btn-primary" onClick={() => openModal('notice')}>
                + Publish New Notice
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Tag</th>
                    <th>Notice Date</th>
                    <th>Pinned</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {notices.map((n) => (
                    <tr key={n.id}>
                      <td>#{n.id}</td>
                      <td><strong>{n.title}</strong></td>
                      <td><span className="badge role-badge">{n.tag || 'General'}</span></td>
                      <td>{n.noticeDate}</td>
                      <td>{n.pinned ? '📌 Pinned' : 'No'}</td>
                      <td>
                        <span className={`status-pill ${n.active ? 'approved' : 'rejected'}`}>
                          {n.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button className="btn-sm btn-secondary" onClick={() => openModal('notice', n)}>
                          Edit
                        </button>
                        <button className="btn-sm btn-danger" onClick={() => handleDeleteNotice(n.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {notices.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center p-4">No notices found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: COURSES CRUD */}
        {activeTab === 'courses' && (
          <div className="admin-tab-section">
            <div className="table-controls-bar justify-between">
              <h3>Degree Programs & Courses Catalog</h3>
              <button className="btn btn-primary" onClick={() => openModal('course')}>
                + Add New Course
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Course Name</th>
                    <th>Duration</th>
                    <th>Total Seats</th>
                    <th>Tuition Fee</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {courses.map((c) => (
                    <tr key={c.id || c.code}>
                      <td><strong>{c.code}</strong></td>
                      <td>{c.name}</td>
                      <td>{c.durationYears} Years</td>
                      <td>{c.totalSeats} Seats</td>
                      <td>₹{c.tuitionFee?.toLocaleString() || '0'}</td>
                      <td>
                        <span className={`status-pill ${c.active ? 'approved' : 'rejected'}`}>
                          {c.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="action-buttons">
                        <button className="btn-sm btn-secondary" onClick={() => openModal('course', c)}>
                          Edit
                        </button>
                        <button className="btn-sm btn-danger" onClick={() => handleDeleteCourse(c.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {courses.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center p-4">No courses listed.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: FACULTY CRUD */}
        {activeTab === 'faculty' && (
          <div className="admin-tab-section">
            <div className="table-controls-bar justify-between">
              <h3>Faculty Members Directory</h3>
              <button className="btn btn-primary" onClick={() => openModal('faculty')}>
                + Add Faculty Member
              </button>
            </div>

            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Photo / Initials</th>
                    <th>Name</th>
                    <th>Designation</th>
                    <th>Qualification</th>
                    <th>Experience</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {faculty.map((f) => (
                    <tr key={f.id}>
                      <td>
                        {f.photoUrl ? (
                          <img
                            src={getFileUrl(f.photoUrl)}
                            alt={f.name}
                            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) e.target.nextSibling.style.display = 'inline-block';
                            }}
                          />
                        ) : null}
                        <span className="badge role-badge" style={{ display: f.photoUrl ? 'none' : 'inline-block' }}>
                          {f.initials || 'FC'}
                        </span>
                      </td>
                      <td><strong>{f.name}</strong></td>
                      <td>{f.designation}</td>
                      <td>{f.qualification}</td>
                      <td>{f.experienceYears || 0} Years</td>
                      <td className="action-buttons">
                        <button className="btn-sm btn-secondary" onClick={() => openModal('faculty', f)}>
                          Edit
                        </button>
                        <button className="btn-sm btn-danger" onClick={() => handleDeleteFaculty(f.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {faculty.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center p-4">No faculty members found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 7: GALLERY CRUD */}
        {activeTab === 'gallery' && (
          <div className="admin-tab-section">
            <div className="table-controls-bar justify-between">
              <h3>Campus Gallery & Photos</h3>
              <button className="btn btn-primary" onClick={() => openModal('gallery')}>
                + Upload / Add Photo Item
              </button>
            </div>

            <div className="gallery-admin-grid">
              {gallery.map((g) => (
                <div key={g.id} className="gallery-admin-card">
                  <img src={getFileUrl(g.imageUrl) || '/uploads/campus.jpg'} alt={g.caption} />
                  <div className="gallery-card-info">
                    <h4>{g.caption || 'Campus Photo'}</h4>
                    <span className="badge role-badge">{g.tag || 'Campus'}</span>
                    <button className="btn-sm btn-danger mt-2" onClick={() => handleDeleteGalleryItem(g.id)}>
                      Delete Photo
                    </button>
                  </div>
                </div>
              ))}
              {gallery.length === 0 && (
                <p className="text-sub p-4">No gallery items found.</p>
              )}
            </div>
          </div>
        )}

        {/* TAB 8: CONTACT MESSAGES INBOX */}
        {activeTab === 'messages' && (
          <div className="admin-tab-section">
            {/* Summary Metrics Bar */}
            <div className="inbox-metrics-row">
              <div className="inbox-metric-card">
                <div className="metric-icon total"><Icon name="mail" /></div>
                <div>
                  <div className="metric-val">{contactMessages.length}</div>
                  <div className="metric-lbl">Total Inquiries</div>
                </div>
              </div>
              <div className="inbox-metric-card">
                <div className="metric-icon unread"><Icon name="bell" /></div>
                <div>
                  <div className="metric-val">{contactMessages.filter(m => m.status === 'UNREAD').length}</div>
                  <div className="metric-lbl">Unread Messages</div>
                </div>
              </div>
              <div className="inbox-metric-card">
                <div className="metric-icon replied"><Icon name="check" /></div>
                <div>
                  <div className="metric-val">{contactMessages.filter(m => m.status === 'REPLIED').length}</div>
                  <div className="metric-lbl">Replied & Solved</div>
                </div>
              </div>
            </div>

            {/* Controls & Filter Bar */}
            <div className="inbox-controls-bar">
              <div className="inbox-search-box">
                <Icon name="search" />
                <input
                  type="text"
                  placeholder="Search by sender name, email, phone, or subject..."
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                />
                {contactSearch && (
                  <button className="clear-search-btn" onClick={() => setContactSearch('')}>✕</button>
                )}
              </div>

              <div className="inbox-filter-pills">
                {['', 'UNREAD', 'READ', 'REPLIED'].map((st) => (
                  <button
                    key={st}
                    className={`filter-pill ${contactStatusFilter === st ? 'active' : ''}`}
                    onClick={() => setContactStatusFilter(st)}
                  >
                    {st === '' ? 'All Messages' : st}
                  </button>
                ))}
              </div>

              <button className="btn btn-secondary btn-sm" onClick={fetchContactMessages} disabled={loading}>
                <Icon name="refresh" /> Refresh
              </button>
            </div>

            {/* Inbox Message Cards List */}
            <div className="inbox-cards-list">
              {contactMessages
                .filter((m) => {
                  if (contactStatusFilter && m.status !== contactStatusFilter) return false;
                  if (contactSearch) {
                    const q = contactSearch.toLowerCase();
                    return (
                      (m.fullName && m.fullName.toLowerCase().includes(q)) ||
                      (m.email && m.email.toLowerCase().includes(q)) ||
                      (m.phone && m.phone.toLowerCase().includes(q)) ||
                      (m.subject && m.subject.toLowerCase().includes(q)) ||
                      (m.message && m.message.toLowerCase().includes(q))
                    );
                  }
                  return true;
                })
                .map((m) => {
                  const initials = (m.fullName || 'User')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .substring(0, 2)
                    .toUpperCase();
                  const isUnread = m.status === 'UNREAD';
                  const isReplied = m.status === 'REPLIED';

                  return (
                    <div key={m.id} className={`inbox-card ${isUnread ? 'unread-card' : ''}`}>
                      <div className="inbox-card-header">
                        <div className="sender-profile">
                          <div className={`avatar-circle ${isUnread ? 'unread-avatar' : isReplied ? 'replied-avatar' : ''}`}>
                            {initials}
                          </div>
                          <div>
                            <div className="sender-name">
                              {m.fullName}
                              {isUnread && <span className="unread-dot" title="New Unread Message" />}
                            </div>
                            <div className="sender-meta">
                              <span>✉️ {m.email}</span>
                              {m.phone && <span>📞 {m.phone}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="inbox-card-meta">
                          <span className={`msg-status-tag status-${m.status ? m.status.toLowerCase() : 'unread'}`}>
                            {m.status}
                          </span>
                          <span className="msg-time">
                            {new Date(m.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className="inbox-card-body">
                        <h4 className="msg-subject">{m.subject || 'General Inquiry'}</h4>
                        <p className="msg-excerpt">{m.message}</p>
                        {m.reply && (
                          <div className="existing-reply-box">
                            <strong>💬 Admin Response ({m.repliedBy || 'Admin'}):</strong>
                            <p>{m.reply}</p>
                          </div>
                        )}
                      </div>

                      <div className="inbox-card-actions">
                        <button
                          className="btn-action btn-view"
                          onClick={() => {
                            if (isUnread) handleMarkMessageRead(m.id);
                            openModal('viewMessage', m);
                          }}
                        >
                          👁️ View Details
                        </button>
                        <button
                          className="btn-action btn-reply"
                          onClick={() => {
                            if (isUnread) handleMarkMessageRead(m.id);
                            openModal('replyMessage', m);
                          }}
                        >
                          💬 Send Reply
                        </button>
                        {isUnread && (
                          <button
                            className="btn-action btn-mark-read"
                            onClick={() => handleMarkMessageRead(m.id)}
                          >
                            ✓ Mark Read
                          </button>
                        )}
                        <button
                          className="btn-action btn-delete"
                          onClick={() => handleDeleteContactMessage(m.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  );
                })}

              {contactMessages.length === 0 && (
                <div className="inbox-empty-state">
                  <div className="empty-icon">📬</div>
                  <h3>No Contact Messages Found</h3>
                  <p>When visitors submit inquiries through the Contact Us page, they will show up here.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* MODAL OVERLAY */}
        {modalType && (
          <div className="admin-modal-overlay" onClick={closeModal}>
            <div className="admin-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>
                  {modalType === 'newAdmission' && '🎓 Admit New Student'}
                  {modalType === 'viewStudent' && `🎓 Student Profile Details - ${activeItem?.studentId}`}
                  {modalType === 'editStudent' && `✏️ Edit Student Record (${activeItem?.studentId})`}
                  {modalType === 'suspendUser' && `Suspend @${activeItem?.username}`}
                  {modalType === 'approveAdmission' && `Approve Admission #${activeItem?.id}`}
                  {modalType === 'rejectAdmission' && `Reject Admission #${activeItem?.id}`}
                  {modalType === 'notice' && (activeItem ? 'Edit Notice' : 'Publish New Notice')}
                  {modalType === 'course' && (activeItem ? 'Edit Course' : 'Create Course')}
                  {modalType === 'faculty' && (activeItem ? 'Edit Faculty Member' : 'Add Faculty Member')}
                  {modalType === 'gallery' && 'Add Gallery Photo'}
                  {modalType === 'viewMessage' && 'Contact Message Details'}
                  {modalType === 'credentialsSuccess' && '🎉 Student Admission Created'}
                </h3>
                <button className="close-btn" onClick={closeModal}>✕</button>
              </div>

              {/* TOGGLABLE MODAL INPUT CONFLICT / WARNING BANNER */}
              {modalError && (
                <div style={{
                  background: '#fff1f2',
                  border: '1px solid #fda4af',
                  color: '#9f1239',
                  padding: '12px 16px',
                  borderRadius: 8,
                  margin: '16px 20px 0 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  lineHeight: 1.5,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: 20 }}>⚠️</span>
                    <div>
                      <strong style={{ display: 'block', fontSize: 13, color: '#881337', marginBottom: 2 }}>
                        User Input Conflict / Validation Warning:
                      </strong>
                      <span>{modalError}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setModalError('')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#9f1239',
                      fontSize: 20,
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      padding: '0 4px',
                      lineHeight: 1
                    }}
                    title="Dismiss Warning"
                  >
                    ×
                  </button>
                </div>
              )}

              {/* SUSPEND USER FORM */}
              {modalType === 'suspendUser' && (
                <form onSubmit={handleSuspendUser} className="admin-modal-form">
                  <div className="form-group">
                    <label>Reason for Suspension</label>
                    <textarea
                      rows="3"
                      value={formData.reason || ''}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="Specify reason for account suspension..."
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary">Confirm Suspension</button>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  </div>
                </form>
              )}

              {/* APPROVE ADMISSION FORM */}
              {modalType === 'approveAdmission' && (
                <form onSubmit={handleApproveAdmission} className="admin-modal-form">
                  <div className="form-group">
                    <label>Approval Remarks / Verification Note</label>
                    <input
                      type="text"
                      value={formData.remarks || ''}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="e.g. Verified eligibility documents and marks sheet."
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary">Confirm Approval</button>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  </div>
                </form>
              )}

              {/* REJECT ADMISSION FORM */}
              {modalType === 'rejectAdmission' && (
                <form onSubmit={handleRejectAdmission} className="admin-modal-form">
                  <div className="form-group">
                    <label>Reason for Rejection</label>
                    <textarea
                      rows="3"
                      value={formData.reason || ''}
                      onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                      placeholder="e.g. Incomplete application or criteria not met"
                      required
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn btn-danger">Confirm Rejection</button>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  </div>
                </form>
              )}

              {/* NOTICE FORM */}
              {modalType === 'notice' && (
                <form onSubmit={handleSaveNotice} className="admin-modal-form">
                  <div className="form-group">
                    <label>Notice Title</label>
                    <input
                      type="text"
                      value={formData.title || ''}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter notice title"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tag / Category</label>
                    <input
                      type="text"
                      value={formData.tag || ''}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="e.g. Admission, Exam, Event"
                    />
                  </div>
                  <ImageUploadInput
                    value={formData.attachmentUrl || ''}
                    onChange={(url) => setFormData({ ...formData, attachmentUrl: url })}
                    label="Notice Image / Document Attachment"
                    uploadType="notices"
                    placeholder="Upload image or document from device or enter URL..."
                  />
                  <div className="form-group">
                    <label>Notice Content</label>
                    <textarea
                      rows="4"
                      value={formData.content || ''}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Write notice details..."
                      required
                    />
                  </div>
                  <div className="form-row">
                    <label className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={!!formData.pinned}
                        onChange={(e) => setFormData({ ...formData, pinned: e.target.checked })}
                      />
                      <span>Pin to Top of Notice Board</span>
                    </label>
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary">Save Notice</button>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  </div>
                </form>
              )}

              {/* COURSE FORM */}
              {modalType === 'course' && (
                <form onSubmit={handleSaveCourse} className="admin-modal-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Course Code</label>
                      <input
                        type="text"
                        value={formData.code || ''}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        placeholder="e.g. BA, BSC, BCA"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Short Name</label>
                      <input
                        type="text"
                        value={formData.shortName || ''}
                        onChange={(e) => setFormData({ ...formData, shortName: e.target.value })}
                        placeholder="e.g. B.A."
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Full Program Name</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Bachelor of Arts"
                      required
                    />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Duration (Years)</label>
                      <input
                        type="number"
                        value={formData.durationYears || 3}
                        onChange={(e) => setFormData({ ...formData, durationYears: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Total Seats</label>
                      <input
                        type="number"
                        value={formData.totalSeats || 60}
                        onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tuition Fee (₹)</label>
                      <input
                        type="number"
                        value={formData.tuitionFee || 0}
                        onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Other Fee (₹)</label>
                      <input
                        type="number"
                        value={formData.otherFee || 0}
                        onChange={(e) => setFormData({ ...formData, otherFee: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Eligibility Criteria</label>
                    <input
                      type="text"
                      value={formData.eligibility || ''}
                      onChange={(e) => setFormData({ ...formData, eligibility: e.target.value })}
                      placeholder="e.g. 10+2 in any stream with 45%"
                    />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary">Save Course</button>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  </div>
                </form>
              )}

              {/* FACULTY FORM */}
              {modalType === 'faculty' && (
                <form onSubmit={handleSaveFaculty} className="admin-modal-form">
                  <div className="form-group">
                    <label>Full Name & Title</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Dr. Ramesh Kumar"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Designation</label>
                    <input
                      type="text"
                      value={formData.designation || ''}
                      onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                      placeholder="e.g. Associate Professor & HOD"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Qualification</label>
                    <input
                      type="text"
                      value={formData.qualification || ''}
                      onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
                      placeholder="e.g. Ph.D. in Physics, M.Sc."
                      required
                    />
                  </div>
                  <ImageUploadInput
                    value={formData.photoUrl || ''}
                    onChange={(url) => setFormData({ ...formData, photoUrl: url })}
                    label="Faculty Photograph"
                    uploadType="faculty"
                    placeholder="Upload faculty photo from device or enter URL..."
                  />
                  <div className="form-row">
                    <div className="form-group">
                      <label>Initials</label>
                      <input
                        type="text"
                        value={formData.initials || ''}
                        onChange={(e) => setFormData({ ...formData, initials: e.target.value })}
                        placeholder="e.g. RK"
                      />
                    </div>
                    <div className="form-group">
                      <label>Experience (Years)</label>
                      <input
                        type="number"
                        value={formData.experienceYears || 0}
                        onChange={(e) => setFormData({ ...formData, experienceYears: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary">Save Faculty</button>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  </div>
                </form>
              )}

              {/* GALLERY FORM */}
              {modalType === 'gallery' && (
                <form onSubmit={handleSaveGalleryItem} className="admin-modal-form">
                  <div className="form-group">
                    <label>Photo Caption</label>
                    <input
                      type="text"
                      value={formData.caption || ''}
                      onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                      placeholder="e.g. Science Laboratory Session"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Tag / Category</label>
                    <input
                      type="text"
                      value={formData.tag || ''}
                      onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                      placeholder="e.g. Campus, Sports, Event"
                    />
                  </div>
                  <ImageUploadInput
                    value={formData.imageUrl || ''}
                    onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                    label="Gallery Photograph"
                    uploadType="gallery"
                    placeholder="Upload photo from device or enter URL..."
                  />
                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary">Add Photo</button>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                  </div>
                </form>
              )}
              {/* VIEW CONTACT MESSAGE DETAIL */}
              {modalType === 'viewMessage' && activeItem && (
                <div className="admin-modal-form">
                  <div className="form-group mb-3">
                    <label style={{ fontSize: 12, color: 'var(--slate-soft)' }}>SENDER</label>
                    <div style={{ fontSize: 16, fontWeight: 600 }}>{activeItem.fullName}</div>
                  </div>
                  <div className="form-row mb-3">
                    <div className="form-group">
                      <label style={{ fontSize: 12, color: 'var(--slate-soft)' }}>EMAIL</label>
                      <div>{activeItem.email}</div>
                    </div>
                    <div className="form-group">
                      <label style={{ fontSize: 12, color: 'var(--slate-soft)' }}>PHONE</label>
                      <div>{activeItem.phone || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="form-group mb-3">
                    <label style={{ fontSize: 12, color: 'var(--slate-soft)' }}>SUBJECT</label>
                    <div style={{ fontWeight: 600 }}>{activeItem.subject || 'General Inquiry'}</div>
                  </div>
                  <div className="form-group mb-4">
                    <label style={{ fontSize: 12, color: 'var(--slate-soft)' }}>MESSAGE CONTENT</label>
                    <div style={{
                      background: 'var(--slate-dim, #f8fafc)',
                      padding: 14,
                      borderRadius: 8,
                      border: '1px solid var(--border-color, #e2e8f0)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.6,
                      fontSize: 14
                    }}>
                      {activeItem.message}
                    </div>
                  </div>
                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => {
                        closeModal();
                        openModal('replyMessage', activeItem);
                      }}
                    >
                      💬 Send Reply
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Close</button>
                  </div>
                </div>
              )}

              {/* REPLY CONTACT MESSAGE FORM */}
              {modalType === 'replyMessage' && activeItem && (
                <form onSubmit={handleSendReply} className="admin-modal-form">
                  <div className="form-group mb-3">
                    <label style={{ fontSize: 12, color: 'var(--slate-soft)' }}>RECIPIENT</label>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>
                      {activeItem.fullName} &lt;{activeItem.email}&gt;
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label style={{ fontSize: 12, color: 'var(--slate-soft)' }}>ORIGINAL INQUIRY</label>
                    <div className="quote-inquiry-box">
                      <strong>Subject: {activeItem.subject || 'General Inquiry'}</strong>
                      <p>{activeItem.message}</p>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <div className="quick-template-bar">
                      <label style={{ fontSize: 12, color: 'var(--slate-soft)' }}>QUICK TEMPLATES:</label>
                      <button
                        type="button"
                        className="btn-template-chip"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            replyText: `Dear ${activeItem.fullName},\n\nThank you for reaching out regarding admissions. Admissions for 2026-27 session are currently open. You can apply directly on our website or visit the campus admissions desk.\n\nBest regards,\nAdmissions Desk, SKM College`,
                          })
                        }
                      >
                        + Admissions
                      </button>
                      <button
                        type="button"
                        className="btn-template-chip"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            replyText: `Dear ${activeItem.fullName},\n\nThank you for your inquiry about fee structure and courses. Please check our website Courses section or contact the office at 05342-240100 for current session details.\n\nBest regards,\nSKM College Office`,
                          })
                        }
                      >
                        + Fee Details
                      </button>
                      <button
                        type="button"
                        className="btn-template-chip"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            replyText: `Dear ${activeItem.fullName},\n\nThank you for contacting Shiv Kumari Mahavidyalaya. We have reviewed your message and will assist you shortly.\n\nBest regards,\nAdministration, SKM College`,
                          })
                        }
                      >
                        + General Ack
                      </button>
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label>Your Response Email Message *</label>
                    <textarea
                      rows="6"
                      value={formData.replyText || ''}
                      onChange={(e) => setFormData({ ...formData, replyText: e.target.value })}
                      placeholder="Type your response email message here..."
                      required
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Sending...' : '✉️ Send Reply Email'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* NEW ADMISSION FORM MODAL */}
              {modalType === 'newAdmission' && (
                <form onSubmit={handleCreateNewAdmission} className="admin-modal-form">
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
                    🎓 New Student Admission
                  </h3>
                  <p style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
                    Admit a new student. Upon submission, a unique Student ID will be generated automatically, and login credentials will be created (Username = Student ID, Password = DOB).
                  </p>

                  <div className="form-group mb-3">
                    <label>Student Full Name *</label>
                    <input
                      type="text"
                      value={newAdmissionForm.name}
                      onChange={(e) => setNewAdmissionForm({ ...newAdmissionForm, name: e.target.value })}
                      placeholder="e.g. Anjali Verma"
                      required
                    />
                  </div>

                  <div className="form-row mb-3">
                    <div className="form-group">
                      <label>Date of Birth (DOB) *</label>
                      <input
                        type="date"
                        value={newAdmissionForm.dob}
                        onChange={(e) => setNewAdmissionForm({ ...newAdmissionForm, dob: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number *</label>
                      <input
                        type="tel"
                        value={newAdmissionForm.mobileNumber}
                        onChange={(e) => setNewAdmissionForm({ ...newAdmissionForm, mobileNumber: e.target.value })}
                        placeholder="e.g. 9876543210"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row mb-3">
                    <div className="form-group">
                      <label>Email Address (Optional)</label>
                      <input
                        type="email"
                        value={newAdmissionForm.email}
                        onChange={(e) => setNewAdmissionForm({ ...newAdmissionForm, email: e.target.value })}
                        placeholder="e.g. student@gmail.com"
                      />
                    </div>
                    <div className="form-group">
                      <label>Course Programme *</label>
                      <select
                        value={newAdmissionForm.courseName}
                        onChange={(e) => setNewAdmissionForm({ ...newAdmissionForm, courseName: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontWeight: 600 }}
                      >
                        <option value="BA">BA (Bachelor of Arts)</option>
                        <option value="BSC">BSC (Bachelor of Science)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Semester *</label>
                      <select
                        value={newAdmissionForm.semester || 'Semester 1'}
                        onChange={(e) => setNewAdmissionForm({ ...newAdmissionForm, semester: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontWeight: 600 }}
                      >
                        <option value="Semester 1">Semester 1</option>
                        <option value="Semester 2">Semester 2</option>
                        <option value="Semester 3">Semester 3</option>
                        <option value="Semester 4">Semester 4</option>
                        <option value="Semester 5">Semester 5</option>
                        <option value="Semester 6">Semester 6</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group mb-4">
                    <label>Address *</label>
                    <textarea
                      rows="2"
                      value={newAdmissionForm.address}
                      onChange={(e) => setNewAdmissionForm({ ...newAdmissionForm, address: e.target.value })}
                      placeholder="Enter village, post, district, state..."
                      required
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Admitting Student...' : '✔ Confirm & Admit Student'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* GENERATED CREDENTIALS MODAL */}
              {modalType === 'credentialsSuccess' && createdCredentials && (
                <div className="admin-modal-form" style={{ textAlign: 'center', padding: '10px 0' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#16a34a', margin: '0 0 6px 0' }}>
                    Student Admission Successful!
                  </h3>
                  <p style={{ color: '#475569', fontSize: 14, marginBottom: 20 }}>
                    Official admission created for <strong>{createdCredentials.name}</strong> ({createdCredentials.courseName}).
                  </p>

                  <div style={{ background: '#f8fafc', border: '2px dashed #2563eb', borderRadius: 12, padding: 20, marginBottom: 24, textAlign: 'left' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#2563eb', textTransform: 'uppercase', marginBottom: 12, textAlign: 'center' }}>
                      🔑 Generated Login Credentials
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Generated Student ID:</span>
                      <strong style={{ color: '#0f172a', fontSize: 16, fontFamily: 'monospace' }}>{createdCredentials.studentId}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10, paddingBottom: 8, borderBottom: '1px solid #e2e8f0' }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Login Username:</span>
                      <strong style={{ color: '#2563eb', fontSize: 16, fontFamily: 'monospace' }}>{createdCredentials.username}</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                      <span style={{ color: '#64748b', fontWeight: 600 }}>Login Password (DOB):</span>
                      <strong style={{ color: '#16a34a', fontSize: 16, fontFamily: 'monospace' }}>{createdCredentials.password}</strong>
                    </div>
                  </div>

                  <button type="button" className="btn btn-primary btn-block" onClick={closeModal}>
                    Done & Close
                  </button>
                </div>
              )}

              {/* VIEW STUDENT MODAL */}
              {modalType === 'viewStudent' && activeItem && (
                <div className="admin-modal-form">
                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: 20, marginBottom: 20 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, paddingBottom: 10, borderBottom: '1px solid #cbd5e1' }}>
                      <div>
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>STUDENT ID</span>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#2563eb', fontFamily: 'monospace' }}>{activeItem.studentId}</div>
                      </div>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 800 }}>
                        ✔ ADMITTED
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 14 }}>
                      <div>
                        <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>FULL NAME</span>
                        <strong style={{ color: '#0f172a' }}>{activeItem.name}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>DATE OF BIRTH (DOB)</span>
                        <strong style={{ color: '#0f172a' }}>{activeItem.dob || 'N/A'}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>MOBILE NUMBER</span>
                        <span>{activeItem.mobileNumber || 'N/A'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>EMAIL ADDRESS</span>
                        <span>{activeItem.email || 'N/A'}</span>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>PROGRAMME / COURSE</span>
                        <strong style={{ color: '#0f172a' }}>{activeItem.courseName}</strong>
                      </div>
                      <div>
                        <span style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', display: 'block', fontWeight: 700 }}>ADDRESS</span>
                        <span>{activeItem.address || 'N/A'}</span>
                      </div>
                    </div>

                    <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, textAlign: 'center' }}>
                      <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 11, color: '#64748b', display: 'block', fontWeight: 700 }}>TOTAL FEE</span>
                        <strong style={{ color: '#0f172a', fontSize: 15 }}>₹{Number(activeItem.totalFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                      </div>
                      <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 11, color: '#64748b', display: 'block', fontWeight: 700 }}>PAID FEE</span>
                        <strong style={{ color: '#16a34a', fontSize: 15 }}>₹{Number(activeItem.paidFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                      </div>
                      <div style={{ background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid #e2e8f0' }}>
                        <span style={{ fontSize: 11, color: '#64748b', display: 'block', fontWeight: 700 }}>REMAINING</span>
                        <strong style={{ color: activeItem.remainingFee <= 0 ? '#16a34a' : '#dc2626', fontSize: 15 }}>₹{Number(activeItem.remainingFee || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="modal-actions">
                    <button
                      type="button"
                      className="btn btn-warning"
                      onClick={() => {
                        closeModal();
                        openModal('editStudent', activeItem);
                      }}
                    >
                      ✏️ Edit Student Details
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Close
                    </button>
                  </div>
                </div>
              )}

              {/* EDIT STUDENT MODAL */}
              {modalType === 'editStudent' && activeItem && (
                <form onSubmit={handleUpdateStudent} className="admin-modal-form">
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
                    ✏️ Edit Student Record
                  </h3>

                  <div className="form-row mb-3">
                    <div className="form-group">
                      <label>Permanent Student ID (Read-only)</label>
                      <input
                        type="text"
                        value={activeItem.studentId || ''}
                        disabled
                        style={{ background: '#f1f5f9', cursor: 'not-allowed', fontWeight: 800, color: '#2563eb', fontFamily: 'monospace' }}
                      />
                    </div>
                    <div className="form-group">
                      <label>Student Full Name *</label>
                      <input
                        type="text"
                        value={editStudentForm.name}
                        onChange={(e) => setEditStudentForm({ ...editStudentForm, name: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row mb-3">
                    <div className="form-group">
                      <label>Date of Birth (DOB) *</label>
                      <input
                        type="date"
                        value={editStudentForm.dob}
                        onChange={(e) => setEditStudentForm({ ...editStudentForm, dob: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Mobile Number *</label>
                      <input
                        type="tel"
                        value={editStudentForm.mobileNumber}
                        onChange={(e) => setEditStudentForm({ ...editStudentForm, mobileNumber: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row mb-3">
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        value={editStudentForm.email}
                        onChange={(e) => setEditStudentForm({ ...editStudentForm, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Course Programme *</label>
                      <select
                        value={editStudentForm.courseName}
                        onChange={(e) => setEditStudentForm({ ...editStudentForm, courseName: e.target.value })}
                        required
                        style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
                      >
                        <option value="Bachelor of Arts (B.A.)">Bachelor of Arts (B.A.)</option>
                        <option value="Bachelor of Science (B.Sc.)">Bachelor of Science (B.Sc.)</option>
                        <option value="Bachelor of Commerce (B.Com.)">Bachelor of Commerce (B.Com.)</option>
                        <option value="Bachelor of Computer Applications (BCA)">Bachelor of Computer Applications (BCA)</option>
                        <option value="Bachelor of Education (B.Ed.)">Bachelor of Education (B.Ed.)</option>
                        <option value="M.A. Hindi">M.A. Hindi</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group mb-3">
                    <label>Total Course Fee (₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editStudentForm.totalCourseFee}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, totalCourseFee: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group mb-4">
                    <label>Address *</label>
                    <textarea
                      rows="2"
                      value={editStudentForm.address}
                      onChange={(e) => setEditStudentForm({ ...editStudentForm, address: e.target.value })}
                      required
                    />
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? 'Saving Changes...' : '✔ Save Changes'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* EDIT FEE STRUCTURE MODAL */}
              {modalType === 'editFeeStructure' && editingFeeStructure && (
                <form onSubmit={handleSaveFeeStructure} className="admin-modal-form">
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', marginBottom: 16 }}>
                    ⚙️ Edit Fee Structure - {editingFeeStructure.courseCode} ({editingFeeStructure.semester})
                  </h3>

                  <div className="form-row mb-3">
                    <div className="form-group">
                      <label>Academic Fee (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingFeeStructure.academicFee ?? 0}
                        onChange={(e) => setEditingFeeStructure({ ...editingFeeStructure, academicFee: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Sports Fee (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingFeeStructure.sportsFee ?? 0}
                        onChange={(e) => setEditingFeeStructure({ ...editingFeeStructure, sportsFee: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-row mb-3">
                    <div className="form-group">
                      <label>Examination Fee (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingFeeStructure.examFee ?? 0}
                        onChange={(e) => setEditingFeeStructure({ ...editingFeeStructure, examFee: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Other Fee (₹) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={editingFeeStructure.otherFee ?? 0}
                        onChange={(e) => setEditingFeeStructure({ ...editingFeeStructure, otherFee: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ background: '#f8fafc', padding: 14, borderRadius: 8, marginBottom: 20, border: '1px solid #cbd5e1', textAlign: 'right' }}>
                    <span style={{ fontSize: 13, color: '#64748b', marginRight: 12 }}>Calculated Total Fee:</span>
                    <strong style={{ fontSize: 20, color: '#16a34a' }}>
                      ₹{((parseFloat(editingFeeStructure.academicFee || 0) + parseFloat(editingFeeStructure.sportsFee || 0) + parseFloat(editingFeeStructure.examFee || 0) + parseFloat(editingFeeStructure.otherFee || 0)) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </strong>
                  </div>

                  <div className="modal-actions">
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ background: '#16a34a', borderColor: '#16a34a', fontWeight: 700 }}>
                      {loading ? 'Saving Structure...' : '✔ Save Fee Structure'}
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* CUSTOM APPLICATION CONFIRMATION DIALOG MODAL */}
        {confirmModal.isOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: 20
          }}>
            <div style={{
              background: '#ffffff',
              borderRadius: 16,
              maxWidth: 480,
              width: '100%',
              padding: '28px 24px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              textAlign: 'center'
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: confirmModal.variant === 'danger' ? '#fee2e2' : confirmModal.variant === 'success' ? '#dcfce7' : confirmModal.variant === 'warning' ? '#fef3c7' : '#e0f2fe',
                color: confirmModal.variant === 'danger' ? '#dc2626' : confirmModal.variant === 'success' ? '#15803d' : confirmModal.variant === 'warning' ? '#b45309' : '#0284c7',
                fontSize: 26,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px auto'
              }}>
                {confirmModal.variant === 'danger' ? '⚠️' : confirmModal.variant === 'success' ? '✔' : confirmModal.variant === 'warning' ? '⚡' : '❓'}
              </div>

              <h3 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0' }}>
                {confirmModal.title}
              </h3>
              
              <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.5, margin: '0 0 24px 0' }}>
                {confirmModal.message}
              </p>

              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  type="button"
                  onClick={closeConfirmModal}
                  style={{
                    flex: 1,
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: 'pointer'
                  }}
                >
                  {confirmModal.cancelText}
                </button>

                <button
                  type="button"
                  onClick={handleConfirmAction}
                  style={{
                    flex: 1,
                    padding: '10px 18px',
                    borderRadius: 8,
                    border: 'none',
                    background: confirmModal.variant === 'danger' ? '#dc2626' : confirmModal.variant === 'success' ? '#16a34a' : confirmModal.variant === 'warning' ? '#d97706' : '#2563eb',
                    color: '#ffffff',
                    fontWeight: 800,
                    fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
                  }}
                >
                  {confirmModal.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
