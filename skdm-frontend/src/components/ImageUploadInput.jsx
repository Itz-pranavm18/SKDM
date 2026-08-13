import { useState } from 'react';
import { uploadApi } from '../services/api';
import Icon from './Icons';

export default function ImageUploadInput({
  value,
  onChange,
  label = 'Upload Image or Document',
  uploadType = 'general',
  placeholder = 'Select file from device or enter URL...',
  accept = 'image/*,application/pdf,.doc,.docx'
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setUploading(true);
    try {
      const res = await uploadApi.uploadImage(file, uploadType);
      if (res?.data?.url) {
        onChange(res.data.url);
      } else {
        throw new Error('Upload response missing file URL');
      }
    } catch (err) {
      setError(err.message || 'Failed to upload file from device.');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
    setError('');
  };

  const isDoc = value && (
    value.toLowerCase().endsWith('.pdf') ||
    value.toLowerCase().endsWith('.doc') ||
    value.toLowerCase().endsWith('.docx')
  );

  return (
    <div className="form-group image-upload-group" style={{ marginBottom: 18 }}>
      <label style={{ fontWeight: 700, display: 'block', marginBottom: 6, fontSize: 13, color: '#334155' }}>
        {label}
      </label>

      {/* Live Preview if File is Attached */}
      {value ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 10, background: '#f8fafc', padding: 10, borderRadius: 8, border: '1px solid #cbd5e1' }}>
          {isDoc ? (
            <div style={{ width: 50, height: 50, background: '#e0f2fe', color: '#0369a1', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>
              📄
            </div>
          ) : (
            <img
              src={value}
              alt="Preview"
              style={{ width: 54, height: 54, objectFit: 'cover', borderRadius: 6, border: '1px solid #cbd5e1' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#1e293b', wordBreak: 'break-all' }}>{value}</div>
            <span style={{ fontSize: 11, color: '#16a34a', fontWeight: 600 }}>
              ✔ {isDoc ? 'Document file attached' : 'Image attached'}
            </span>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fca5a5', padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            🗑️ Change / Remove
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Option 1: File Input Button for Device Upload */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <label
              className="btn btn-outline-sm"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                cursor: uploading ? 'not-allowed' : 'pointer',
                background: '#eff6ff',
                borderColor: '#3b82f6',
                color: '#1d4ed8',
                fontWeight: 700,
                padding: '8px 14px',
                borderRadius: 8,
                fontSize: 13
              }}
            >
              <Icon name="upload" /> {uploading ? 'Uploading from device...' : '📁 Upload Image / Document'}
              <input
                type="file"
                accept={accept}
                onChange={handleFileChange}
                disabled={uploading}
                style={{ display: 'none' }}
              />
            </label>
            <span style={{ fontSize: 12, color: '#64748b' }}>Supports JPG, PNG, WEBP, PDF, DOCX</span>
          </div>

          {/* Option 2: URL Text Input Fallback */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="text"
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              style={{ flex: 1, padding: '8px 12px', fontSize: 13, border: '1px solid #cbd5e1', borderRadius: 6 }}
            />
          </div>
        </div>
      )}

      {error && <div style={{ fontSize: 12, color: '#dc2626', marginTop: 4, fontWeight: 600 }}>⚠️ {error}</div>}
    </div>
  );
}
