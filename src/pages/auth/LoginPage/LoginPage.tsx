import { useState } from 'react';
import type { SyntheticEvent } from 'react';
import { useAuth } from '../../../context/AuthContext';
import type { LoginFormData } from '../../../types/auth.types';
import { Container, Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './LoginPage.css';
import loginHospital from '../../../assets/login-hospital.jpg';

export default function LoginPage() {
  const { login } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: true,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      await login(formData);
    } catch (err: unknown) {
      const msg = (err as Error)?.message ?? '';
      if (!msg || msg === 'Failed to fetch' || msg.toLowerCase().includes('networkerror')) {
        setError('Impossible de contacter le serveur. Vérifiez que le backend est démarré.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Container fluid className="h-100 g-0">
        <Row className="h-100 g-0">

          {/* ── PANNEAU GAUCHE : photo ── */}
          <Col xs={12} lg={7} className="login-left d-none d-lg-flex flex-column justify-content-between">
            <img src={loginHospital} alt="" className="login-photo-bg" aria-hidden="true" />
            <div className="login-photo-overlay" />

            <div className="login-logo d-flex align-items-center gap-3">
              <img src="/chuMel-logo.png" alt="CHU-MEL" style={{ height: 52, width: 'auto' }} />
              <div>
                <div className="login-logo__name">CHU-MEL</div>
                <div className="login-logo__tag">Espace Agent Administratif</div>
              </div>
            </div>

            <div className="login-photo-caption">
              <h2 className="login-photo-caption__title">
                Bienvenue sur votre espace administratif
              </h2>
              <p className="login-photo-caption__sub">
                Gérez admissions, rendez-vous et dossiers patients en toute sécurité.
              </p>
            </div>
          </Col>

          {/* ── PANNEAU DROIT : formulaire ── */}
          <Col xs={12} lg={5} className="login-right d-flex flex-column align-items-center justify-content-center">
            <div className="login-form-wrap w-100">

              <div className="d-flex align-items-center gap-3 mb-4 d-lg-none">
                <img src="/chuMel-logo.png" alt="CHU-MEL" style={{ height: 36, width: 'auto' }} />
                <div className="login-logo__name" style={{ color: '#1355a8' }}>CHU-MEL</div>
              </div>

              <div className="mb-4">
                <h1 className="login-title">Connexion</h1>
                <p className="login-subtitle">Accès réservé aux agents administratifs.</p>
              </div>

              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3" controlId="loginEmail">
                  <Form.Label className="login-label">Adresse email</Form.Label>
                  <div className="login-input-wrap">
                    <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    <Form.Control type="email" placeholder="Votre email professionnel"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                      className="login-input" />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3" controlId="loginPassword">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Form.Label className="login-label mb-0">Mot de passe</Form.Label>
                    <span className="login-forgot">Mot de passe oublié ?</span>
                  </div>
                  <div className="login-input-wrap">
                    <svg className="login-input-icon" width="17" height="17" viewBox="0 0 24 24"
                      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2"/>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                    </svg>
                    <Form.Control type="password" placeholder="Votre mot de passe"
                      value={formData.password}
                      onChange={e => setFormData({ ...formData, password: e.target.value })}
                      className="login-input" />
                  </div>
                </Form.Group>

                {error && <Alert variant="danger" className="login-alert py-2 px-3">{error}</Alert>}

                <Form.Group className="mb-4" controlId="loginRemember">
                  <Form.Check type="checkbox" id="loginRemember"
                    label="Se souvenir de moi sur cet appareil"
                    checked={formData.rememberMe}
                    onChange={e => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="login-check" />
                </Form.Group>

                <Button type="submit" disabled={loading} className="login-btn w-100">
                  {loading ? <><Spinner animation="border" size="sm" className="me-2"/>Connexion...</> : 'Se connecter'}
                </Button>
              </Form>
            </div>
            <p className="login-copy">&copy; 2026 CHU-MEL &nbsp;&middot;&nbsp; Tous droits réservés</p>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
