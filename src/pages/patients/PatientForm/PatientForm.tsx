import { useState } from 'react';
import { ArrowLeft, Save, User, Phone, MapPin, Shield, AlertTriangle } from 'lucide-react';
import { PhoneInput } from 'react-international-phone';
import { useNavigation } from '../../../context/NavigationContext';
import { patients } from '../../../services/mockData';

export default function PatientForm() {
  const { navigate, nav } = useNavigation();
  const isEdit = nav.page === 'patient-edit';
  const existing = isEdit && nav.selectedId ? patients.find((p) => p.id === nav.selectedId) : null;

  const [form, setForm] = useState({
    firstName: existing?.firstName ?? '',
    lastName: existing?.lastName ?? '',
    dateOfBirth: existing?.dateOfBirth ?? '',
    gender: existing?.gender ?? 'M',
    phone: existing?.phone ?? '',
    email: existing?.email ?? '',
    address: existing?.address ?? '',
    city: existing?.city ?? '',
    bloodType: existing?.bloodType ?? 'A+',
    insurance: existing?.insurance ?? '',
    insuranceNumber: existing?.insuranceNumber ?? '',
    emergencyContact: existing?.emergencyContact ?? '',
    emergencyPhone: existing?.emergencyPhone ?? '',
    notes: existing?.notes ?? '',
  });
  const [saved, setSaved] = useState(false);

  function handleChange(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => navigate('patients'), 1000);
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button onClick={() => navigate('patients')} className="adm-back-btn"><ArrowLeft size={16} /></button>
        <div>
          <p style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-t0)', margin: 0 }}>
            {isEdit ? 'Modifier le dossier patient' : 'Enregistrer un nouveau patient'}
          </p>
          <p style={{ fontSize: '12px', color: 'var(--c-t2)', margin: '2px 0 0' }}>
            {isEdit ? `Modification de ${existing?.firstName} ${existing?.lastName}` : 'Remplissez toutes les informations requises'}
          </p>
        </div>
      </div>

      {saved && (
        <div className="adm-alert adm-alert-success">
          <Save size={14} style={{ flexShrink: 0 }} />
          Patient {isEdit ? 'mis à jour' : 'enregistré'} avec succès ! Redirection...
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '14px', alignItems: 'start' }}>
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Informations personnelles */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <div className="adm-form-section-icon adm-fsi-blue"><User size={13} /></div>
              <p className="adm-card-title">Informations personnelles</p>
            </div>
            <div className="adm-form-section-body">
              <div className="adm-form-grid adm-form-grid-2">
                <div className="adm-form-field">
                  <label className="adm-label">Prénom *</label>
                  <input type="text" value={form.firstName} onChange={(e) => handleChange('firstName', e.target.value)}
                    className="adm-input" placeholder="Prénom du patient" />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Nom *</label>
                  <input type="text" value={form.lastName} onChange={(e) => handleChange('lastName', e.target.value)}
                    className="adm-input" placeholder="Nom de famille" />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Date de naissance *</label>
                  <input type="date" value={form.dateOfBirth} onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    className="adm-input" />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Sexe *</label>
                  <select value={form.gender} onChange={(e) => handleChange('gender', e.target.value)} className="adm-input">
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Groupe sanguin</label>
                  <select value={form.bloodType} onChange={(e) => handleChange('bloodType', e.target.value)} className="adm-input">
                    {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bg) => <option key={bg}>{bg}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <div className="adm-form-section-icon adm-fsi-blue"><Phone size={13} /></div>
              <p className="adm-card-title">Coordonnées</p>
            </div>
            <div className="adm-form-section-body">
              <div className="adm-form-grid adm-form-grid-2">
                <div className="adm-form-field">
                  <label className="adm-label">Téléphone *</label>
                  <PhoneInput defaultCountry="bj" value={form.phone} onChange={(phone) => handleChange('phone', phone)} inputClassName="adm-input" />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Email</label>
                  <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)}
                    className="adm-input" placeholder="Adresse e-mail" />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Adresse</label>
                  <input type="text" value={form.address} onChange={(e) => handleChange('address', e.target.value)}
                    className="adm-input" placeholder="Adresse complète" />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Ville</label>
                  <input type="text" value={form.city} onChange={(e) => handleChange('city', e.target.value)}
                    className="adm-input" placeholder="" />
                </div>
              </div>
            </div>
          </div>

          {/* Contact d'urgence */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <div className="adm-form-section-icon adm-fsi-red"><AlertTriangle size={13} /></div>
              <p className="adm-card-title">Contact d'urgence</p>
            </div>
            <div className="adm-form-section-body">
              <div className="adm-form-grid adm-form-grid-2">
                <div className="adm-form-field">
                  <label className="adm-label">Nom complet</label>
                  <input type="text" value={form.emergencyContact} onChange={(e) => handleChange('emergencyContact', e.target.value)}
                    className="adm-input" placeholder="Nom du contact d'urgence" />
                </div>
                <div className="adm-form-field">
                  <label className="adm-label">Téléphone</label>
                  <PhoneInput defaultCountry="bj" value={form.emergencyPhone} onChange={(phone) => handleChange('emergencyPhone', phone)} inputClassName="adm-input" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Assurance */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <div className="adm-form-section-icon adm-fsi-green"><Shield size={13} /></div>
              <p className="adm-card-title">Assurance</p>
            </div>
            <div className="adm-form-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="adm-form-field">
                <label className="adm-label">Organisme</label>
                <select value={form.insurance} onChange={(e) => handleChange('insurance', e.target.value)} className="adm-input">
                  <option value="">Non assuré</option>
                  <option value="CNSS">CNSS</option>
                  <option value="SMIG">SMIG</option>
                  <option value="Privée">Assurance privée</option>
                </select>
              </div>
              <div className="adm-form-field">
                <label className="adm-label">N° police</label>
                <input type="text" value={form.insuranceNumber} onChange={(e) => handleChange('insuranceNumber', e.target.value)}
                  className="adm-input" placeholder="Numéro d'assurance" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="adm-form-section">
            <div className="adm-form-section-head">
              <div className="adm-form-section-icon adm-fsi-amber"><MapPin size={13} /></div>
              <p className="adm-card-title">Notes médicales</p>
            </div>
            <div className="adm-form-section-body">
              <textarea value={form.notes} onChange={(e) => handleChange('notes', e.target.value)}
                rows={5} className="adm-input"
                placeholder="Allergies, antécédents, informations importantes..." />
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={handleSave} className="adm-btn adm-btn-primary" style={{ height: '38px', justifyContent: 'center', gap: '6px' }}>
              <Save size={14} />
              {isEdit ? 'Mettre à jour' : 'Enregistrer le patient'}
            </button>
            <button onClick={() => navigate('patients')} className="adm-btn" style={{ height: '38px', justifyContent: 'center' }}>
              Annuler
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
